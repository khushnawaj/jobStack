const axios = require('axios');

const searchJobs = async (query, location, filters = {}) => {
    try {
        if (!query && !location) return [];

        console.log(`Searching for: "${query}" in "${location}" with Filters:`, filters);

        const params = {
            query: `${query || ''} ${location ? 'in ' + location : ''}`,
            page: '1',
            num_pages: '1',
            date_posted: filters.datePosted || 'month', // 'today', '3days', 'week', 'month'
        };

        if (filters.jobType) {
            params.employment_types = filters.jobType.toUpperCase(); // FULLTIME, CONTRACT, PARTTIME, INTERN
        }

        if (filters.remote === 'true') {
            params.remote_jobs_only = 'true';
        }

        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params: params,
            headers: {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);

        if (!response.data.data) return [];

        return response.data.data.map((job, idx) => ({
            id: job.job_id || Date.now() + idx,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : (job.job_is_remote ? 'Remote' : 'Location n/a'),
            type: job.job_employment_type || 'Full-time',
            salary: job.job_min_salary ? `$${job.job_min_salary}` : (job.job_max_salary ? `$${job.job_max_salary}` : 'Not disclosed'),
            posted: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : 'Recently',
            platform: job.job_publisher || 'LinkedIn',
            url: job.job_apply_link,
            logo: job.employer_logo
        }));

    } catch (error) {
        console.error("RapidAPI Search Error:", error.message);
        return [];
    }
};

module.exports = { searchJobs };
