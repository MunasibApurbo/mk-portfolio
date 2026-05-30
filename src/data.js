// Centralized Data Source for Portfolio Content

// Expertise / Teaching Areas (3D Sphere)
export const teachingSubjects = [
    { name: "Character Animation", color: "#22d3ee" },
    { name: "3D & 2D Animation", color: "#22d3ee" },
    { name: "Audio & Video Editing", color: "#22d3ee" },
    { name: "Architectural Visualization", color: "#22d3ee" },
    { name: "Landscape Simulation", color: "#22d3ee" },
    { name: "Lighting & Rendering", color: "#22d3ee" },
    { name: "Motion Graphics", color: "#22d3ee" },
    { name: "3D Modeling", color: "#22d3ee" }
];

// Journey / Work History (Timeline)
export const journeyData = [
    {
        type: 'experience',
        title: 'Lecturer, Multimedia & Creative Technology',
        institution: 'Daffodil International University-DIU',
        period: 'Jun 2023 - Present',
        date: '2023-06-01', // ISO string for safer serialization if needed, though Date object logic is in component
        description: 'Currently teaching Character Animation, 3D & 2D Animation, Lighting & Rendering, Architectural Visualization, Landscape Simulation, Audio & Video Editing within the Department of Multimedia and Creative Technology.',
        tags: []
    },
    {
        type: 'experience',
        title: 'Creative Designer',
        institution: 'Graphicta (Full-time)',
        period: 'Jan 2022 - Jan 2023',
        date: '2022-01-01',
        description: 'Lead Graphic Design Coordinator at Graphicta, a startup advertising agency.',
        tags: ['Graphic Design', 'UI/UX', 'Video Editing']
    },
    {
        type: 'experience',
        title: '3D Artist',
        institution: 'Spiral World (Contract)',
        period: 'Nov 2020 - Apr 2021',
        date: '2020-11-01',
        description: 'Contributed to the "Digital Device & Innovation Expo 2021" (DDI-Expo2021) under the ICT Division.',
        tags: ['3D Lighting', 'Level Design', 'Debugging']
    },
    {
        type: 'experience',
        title: '3D Artist & Level Designer',
        institution: 'Daffodil Education Network (Contract)',
        period: 'Nov 2020 - Jan 2021',
        date: '2020-11-01',
        description: 'Developed "Edugate", the country\'s first Virtual Exhibition on Education during the COVID-19 pandemic.',
        tags: ['Texturing', 'Level Design', '3D Modeling']
    },
    {
        type: 'education',
        title: 'Master of Science in Computer Science & Engineering',
        institution: 'Daffodil International University (Candidate)',
        period: 'Present',
        date: '2024-01-01',
        description: 'Focusing on Advanced Data Analytics, Data Visualization, Fusion of AI and Computational Design.',
        tags: []
    },
    {
        type: 'education',
        title: 'Bachelor of Science in Multimedia & Creative Technology',
        institution: 'Daffodil International University (Graduated)',
        period: 'Completed',
        date: '2023-01-01',
        description: 'CGPA: 3.94 / 4.00.',
        tags: []
    },
    {
        type: 'experience',
        title: 'President',
        institution: 'Club of Dev',
        period: '2021 - 2022',
        date: '2022-06-01',
        description: 'A club from Multimedia & Creative Technology, DIU; which works on video games development.',
        tags: ['Game Development', 'Team Leadership', 'Unity 3D']
    }
];
