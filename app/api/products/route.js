import { NextResponse } from 'next/server';

const categories = [
    {
        id: 1, name: "Premium POP Channels",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop",
        description: "High-grade channels for robust false ceiling structures.",
        products: [
            { id: 101, name: "POP Channel 0.45mm", basePrice: 120, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop", details: ["0.45mm thickness", "Rust-resistant", "12ft length"] },
            { id: 102, name: "POP Channel 0.55mm", basePrice: 150, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop", details: ["0.55mm heavy duty", "High tensile strength", "12ft length"] }
        ]
    },
    {
        id: 2, name: "L-Angle Perimeter Strips",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356f27?q=80&w=600&auto=format&fit=crop",
        description: "Perfect edge support and framing angles.",
        products: [
            { id: 201, name: "L-Angle Standard", basePrice: 85, image: "https://images.unsplash.com/photo-1504307651254-35680f356f27?q=80&w=600&auto=format&fit=crop", details: ["Galvanized iron", "Perfect 90-degree bend", "10ft length"] }
        ]
    }
];

export async function GET() {
    return NextResponse.json(categories);
}