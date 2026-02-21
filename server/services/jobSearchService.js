const axios = require('axios');

const searchJobs = async (query, location, filters = {}) => {
    try {
        if (!query && !location) return [];

        console.log(`Searching for: "${query}" in "${location}" with Filters:`, filters);

        const params = {
            query: `${query || ''} ${filters.experience || ''} in ${location || ''}`.trim(),
            page: '1',
            num_pages: '1',
            date_posted: filters.datePosted || 'month',
        };

        if (filters.jobType) {
            params.employment_types = filters.jobType.toUpperCase();
        }

        if (filters.remote === 'true') {
            params.remote_jobs_only = 'true';
        }

        const rawKey = process.env.RAPID_API_KEY || '';
        const apiKey = rawKey.trim();

        if (!apiKey) {
            console.error("RAPID_API_KEY is missing in environmental variables.");
            return [];
        }

        console.log(`Using RapidAPI Key: ${apiKey.substring(0, 4)}...${apiKey.slice(-4)}`);

        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params,
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                'Accept': 'application/json'
            }
        };

        const response = await axios.request(options);

        if (!response.data || !Array.isArray(response.data.data)) {
            console.warn("Invalid or empty API response:", response.data);
            return [];
        }

        // Track seen IDs to guarantee uniqueness
        const seenIds = new Set();

        return response.data.data
            .map((job, idx) => {
                // Build a guaranteed unique ID using index as fallback
                let uniqueId = job.job_id || `job-${idx}`;
                // If we've seen this ID before, append index to make it unique
                if (seenIds.has(uniqueId)) {
                    uniqueId = `${uniqueId}-dup-${idx}`;
                }
                seenIds.add(uniqueId);

                return {
                    id: uniqueId,
                    title: job.job_title || 'Untitled Role',
                    company: job.employer_name || 'Unknown Company',
                    location: job.job_city
                        ? `${job.job_city}, ${job.job_country}`
                        : (job.job_is_remote ? 'Remote' : job.job_country || 'Location N/A'),
                    isRemote: Boolean(job.job_is_remote),
                    type: job.job_employment_type || 'FULLTIME',
                    salary: job.job_min_salary
                        ? `$${Number(job.job_min_salary).toLocaleString()}`
                        : (job.job_max_salary
                            ? `$${Number(job.job_max_salary).toLocaleString()}`
                            : 'Not disclosed'),
                    postedDate: job.job_posted_at_datetime_utc || null,
                    posted: job.job_posted_at_datetime_utc
                        ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Recently',
                    platform: job.job_publisher || 'Job Board',
                    url: job.job_apply_link || '#',
                    logo: job.employer_logo || null,
                    description: job.job_description ? job.job_description.slice(0, 300) : '',
                };
            });

    } catch (error) {
        if (error.response) {
            console.error("RapidAPI Search Error Response:", error.response.data);
            console.error("Status Code:", error.response.status);
        } else {
            console.error("RapidAPI Search Error (No Response):", error.message);
        }
        return [];
    }
};

module.exports = { searchJobs };
