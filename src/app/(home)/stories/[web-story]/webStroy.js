'use client';
import "./page.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const slides = [
    { id: 1, title: 'Welcome', img: '/images/story1.jpg', caption: 'Start your journey' },
    { id: 2, title: 'Explore', img: '/images/story2.jpg', caption: 'Discover amazing places' },
    { id: 3, title: 'Enjoy', img: '/images/story3.jpg', caption: 'Experience the best' },
];

export default function WebStroy() {
    return (
        <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 3000 }}
            loop={true}
            className="h-screen"
        >
            {slides.map(slide => (
                <SwiperSlide key={slide.id}>
                    <div
                        className="h-screen bg-cover bg-center flex flex-col justify-end text-white p-6"
                        style={{ backgroundImage: `url(${slide.img})` }}
                    >
                        <h1 className="text-4xl font-bold">{slide.title}</h1>
                        <p className="text-lg">{slide.caption}</p>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}