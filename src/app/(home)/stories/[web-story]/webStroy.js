'use client';
import "./page.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

function getStoryImageUrl(image) {
    const raw = String(image || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = process.env.NEXT_PUBLIC_IMAGE_URL || "";
    return `${base}web-story/${raw}`;
}

export default function WebStroy({ storyData }) {
    const slides = Array.isArray(storyData?.webStories) ? storyData.webStories : [];
    return (
        <section lang="en-IN" aria-label="Web story slides">
        <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 3000 }}
            loop={true}
            className="h-screen"
        >
            {slides.map((slide, index) => (
                <SwiperSlide key={slide.id}>
                    <div
                        className="h-screen bg-cover bg-center flex flex-col justify-end text-white p-6"
                        style={{ backgroundImage: `url(${getStoryImageUrl(slide.storyImage)})` }}
                    >
                        {index === 0 ? (
                            <h1 className="text-4xl font-bold">{slide.storyTitle}</h1>
                        ) : (
                            <h2 className="text-4xl font-bold">{slide.storyTitle}</h2>
                        )}
                        <p className="text-lg">{slide.storyDescription}</p>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
        </section>
    );
}