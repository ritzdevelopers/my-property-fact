import { NextResponse } from 'next/server';
import axios from 'axios';
import { validateLeadFields } from '@/lib/leadValidation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request) {
    try {
        const body = await request.json();
        const { sessionId, name, mobile, email, project } = body;

        const validation = validateLeadFields({
            name,
            email,
            phone: mobile,
        });
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.name || validation.email || validation.phone,
                },
                { status: 400 }
            );
        }

        // Submit enquiry to your backend API
        // Replace this URL with your actual enquiry endpoint
        const enquiryData = {
            name,
            mobile,
            email,
            projectName: project,
            sessionId,
            source: 'chatbot'
        };

        try {
            // Adjust this endpoint based on your backend API structure
            const response = await axios.post(`${API_URL}/enquiry/create`, enquiryData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.success) {
                return NextResponse.json({
                    success: true,
                    reply: 'Thank you for your interest! Our consultant will contact you within 24 hours.',
                    followUp: null,
                    options: ['Restart']
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: response.data?.message || 'Failed to submit enquiry. Please try again.'
                }, { status: 500 });
            }
        } catch (apiError) {
            console.error('Enquiry API error:', apiError);
            // Even if backend fails, we can still return success to user
            // You might want to log this for admin review
            return NextResponse.json({
                success: true,
                reply: 'Thank you for sharing your details. Our consultant will contact you within 24 hours.',
                followUp: null,
                options: ['Restart']
            });
        }
    } catch (error) {
        console.error('Enquiry route error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
