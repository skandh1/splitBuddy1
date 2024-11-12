import React from 'react';
import { Receipt, School, Users, CloudLightning, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();
    const teamMembers = [
        "Skandh Jadon",
        "Rajveer Chaudhary",
        "Pradhyumn Singh,
        "Aayush Patidar"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 group"
                    >
                        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="bg-blue-600 p-4 rounded-full">
                                <Receipt className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">SplitBuddy</h1>
                        <p className="text-xl text-gray-600">Group Minor Project</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-semibold">Team Members</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-lg text-gray-800">{member}</p>
                                    <p className="text-sm text-gray-600">MCA 3rd Semester, Section A</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <School className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-semibold">Institution</h2>
                        </div>
                        <p className="text-lg text-gray-800">School of Computer Science and Information Technology</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <CloudLightning className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-semibold">Course Details</h2>
                        </div>
                        <p className="text-lg text-gray-800">Cloud Computing Project</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
