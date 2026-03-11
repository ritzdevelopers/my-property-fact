'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/a/macros/ritzmediaworld.com/s/AKfycbxQfo3z2oSU6WNkTJfqJQDsk7mQa7ZX-xPn5AZIaLhHXabRY4bUHi99ETeGtylw0Ka0/exec';

async function submitToGoogleSheets(formData, formType = 'contact', sheetName = 'Google Display') {
  try {
    const data = {
      sheetName,
      Name: formData.name || formData.get('name'),
      Email: formData.email || formData.get('email'),
      Phone: formData.phone || formData.get('phone'),
      Message: formData.message || formData.get('message'),
    };
    const formDataToSend = new FormData();
    Object.keys(data).forEach((key) => {
      formDataToSend.append(key, data[key]);
    });
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formDataToSend,
    });
    const result = await response.json();
    const res = await handleCRMData(formData);
    if (result.result === 'success' && res.success) {
      return { success: true, message: 'Form submitted successfully!' };
    }
    throw new Error(result.error?.message || res.message || 'Failed to submit form. Please try again.');
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return { success: false, message: error.message || 'Failed to submit form. Please try again.' };
  }
}

async function handleCRMData(formData) {
  const name = formData.name || formData.get('name');
  const email = formData.email || formData.get('email');
  const phone = formData.phone || formData.get('phone');
  const srd = '6992d1e5735daf72f8b54cf9';
  try {
    const baseUrl = 'https://app.sell.do/api/leads/create';
    const params = new URLSearchParams({
      api_key: '2c6ef87e83b9437a7007c7f8183099ca',
      'sell_do[form][lead][name]': name,
      'sell_do[form][lead][email]': email,
      'sell_do[form][lead][phone]': phone,
      'sell_do[campaign][srd]': srd,
      'sell_do[form][content][note]': 'Website Inquiry',
    });
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();
    if (data.selldo_lead_details.lead_already_exists === false) {
      return { success: true, message: 'CRM data submitted successfully!' };
    }
    return { success: false, message: 'Lead already exists in CRM.' };
  } catch (error) {
    console.log('Error submitting to CRM:', error);
    return { success: false, message: error.message || 'Failed to submit CRM data. Please try again.' };
  }
}

function Page({ sheet_name }) {
  const sheetName = sheet_name ?? 'Google Display';

  useEffect(() => {
    function openContactModal() {
      const modal = document.getElementById('contactModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeContactModal() {
      const modal = document.getElementById('contactModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        const form = document.getElementById('modal-contact-form');
        if (form) form.reset();
      }
    }

    async function handleFormSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
      try {
        const formData = new FormData(form);
        const result = await submitToGoogleSheets(formData, 'contact', sheetName);
        await handleCRMData(formData);
        if (result.success) {
          sessionStorage.setItem('previousUrl', window.location.href);
          window.location.href = '/landing-pages/eldeco-7-peaks/thank-you';
        } else {
          alert('Error: ' + result.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    }

    async function handleModalFormSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const submitBtn = document.getElementById('modal-submit-btn');
      const submitText = document.getElementById('modal-submit-text');
      const submitLoading = document.getElementById('modal-submit-loading');
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.classList.add('hidden');
      if (submitLoading) submitLoading.classList.remove('hidden');
      try {
        const formData = new FormData(form);
        const result = await submitToGoogleSheets(formData, 'modal', sheetName);
        if (result.success) {
          closeContactModal();
          sessionStorage.setItem('previousUrl', window.location.href);
          window.location.href = '/landing-pages/eldeco-7-peaks/thank-you';
        } else {
          alert('Error: ' + result.message);
          if (submitBtn) submitBtn.disabled = false;
          if (submitText) submitText.classList.remove('hidden');
          if (submitLoading) submitLoading.classList.add('hidden');
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.classList.remove('hidden');
        if (submitLoading) submitLoading.classList.add('hidden');
      }
    }

    function initEldecoStatsCounter() {
      const section = document.getElementById('eldeco-group');
      const statEls = document.querySelectorAll('.eldeco-stat-num');
      if (!section || !statEls.length) return;
      statEls.forEach((el) => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.value).toLocaleString('en-IN') + suffix;
          },
        });
      });
    }

    gsap.registerPlugin(ScrollTrigger);
    initEldecoStatsCounter();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const navbar = document.getElementById('navbar');
    const mobileNavbar = document.getElementById('mobile-navbar');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('menu-toggle');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    function handleNavbarScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (navbar) {
        if (scrollY > 0) {
          navbar.classList.add('bg-black');
          navbar.classList.remove('bg-transparent');
        } else {
          navbar.classList.remove('bg-black');
          navbar.classList.add('bg-transparent');
        }
      }
      if (mobileNavbar) {
        if (scrollY > 0) {
          mobileNavbar.classList.add('bg-black');
          mobileNavbar.classList.remove('bg-transparent');
        } else {
          mobileNavbar.classList.remove('bg-black');
          mobileNavbar.classList.add('bg-transparent');
        }
      }
    }

    lenis.on('scroll', () => {
      handleNavbarScroll();
      ScrollTrigger.update();
    });
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-nav');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          lenis.scrollTo(targetSection, {
            offset: -80,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      });
    });

    document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-scroll-to');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          e.preventDefault();
          lenis.scrollTo(targetSection, {
            offset: -80,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      });
    });

    if (menuToggle && mobileMenu && menuIcon && closeIcon) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('opacity-100');
        if (isOpen) {
          mobileMenu.classList.add('opacity-0', 'pointer-events-none');
          mobileMenu.classList.remove('opacity-100');
          menuIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
          document.body.style.overflow = '';
        } else {
          mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
          mobileMenu.classList.add('opacity-100');
          menuIcon.classList.add('hidden');
          closeIcon.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const targetId = href === '#' ? null : href?.slice(1);
        const targetSection = targetId ? document.getElementById(targetId) : null;
        if (targetSection) {
          lenis.scrollTo(targetSection, {
            offset: -80,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
        if (mobileMenu && menuIcon && closeIcon) {
          mobileMenu.classList.add('opacity-0', 'pointer-events-none');
          mobileMenu.classList.remove('opacity-100');
          menuIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });

    const sliderWrapper = document.querySelector('.banner-slider-wrapper');
    const paginationDots = document.querySelectorAll('.banner-pagination-dot');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, 2));
      if (sliderWrapper) {
        sliderWrapper.style.transform = `translateX(-${currentSlide * 33.333}%)`;
      }
      paginationDots.forEach((dot, i) => {
        if (dot) {
          dot.classList.toggle('bg-white', i === currentSlide);
          dot.classList.toggle('bg-white/50', i !== currentSlide);
        }
      });
    }

    function startSlider() {
      slideInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % 3);
      }, 4000);
    }

    if (paginationDots.length) {
      paginationDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          goToSlide(i);
          clearInterval(slideInterval);
          startSlider();
        });
      });
      startSlider();
    }

    const highlightsSlider = document.querySelector('.highlights-slider');
    const highlightsTrack = document.querySelector('.highlights-track');
    const highlightsSlides = document.querySelectorAll('.highlights-slide');
    const highlightsNext = document.getElementById('highlights-next');
    const highlightsPrev = document.getElementById('highlights-prev');

    let highlightsIndex = 0;
    let visibleCount = 3;
    let gap = 24;

    function getVisibleCount() {
      if (!highlightsSlider) return 1;
      const containerWidth = highlightsSlider.offsetWidth;
      return containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1;
    }

    function setHighlightsSlideWidth() {
      if (!highlightsSlider || !highlightsSlides.length) return;
      visibleCount = getVisibleCount();
      const containerWidth = highlightsSlider.offsetWidth;
      if (containerWidth < 375) gap = 12;
      else if (containerWidth < 640) gap = 16;
      else if (containerWidth < 768) gap = 20;
      else if (containerWidth < 1024) gap = 24;
      else gap = 24;
      const slideWidth = (containerWidth - (visibleCount - 1) * gap) / visibleCount;
      highlightsSlides.forEach((slide) => {
        slide.style.width = `${slideWidth}px`;
      });
    }

    function updateHighlightsSlider() {
      if (!highlightsTrack || !highlightsSlides.length) return;
      const slideWidth = highlightsSlides[0].offsetWidth + gap;
      highlightsTrack.style.transform = `translateX(-${highlightsIndex * slideWidth}px)`;
    }

    function nextHighlightsSlide() {
      const maxIndex = highlightsSlides.length - visibleCount;
      highlightsIndex = highlightsIndex >= maxIndex ? 0 : highlightsIndex + 1;
      updateHighlightsSlider();
    }

    function prevHighlightsSlide() {
      const maxIndex = highlightsSlides.length - visibleCount;
      highlightsIndex = highlightsIndex <= 0 ? maxIndex : highlightsIndex - 1;
      updateHighlightsSlider();
    }

    if (highlightsNext) highlightsNext.addEventListener('click', nextHighlightsSlide);
    if (highlightsPrev) highlightsPrev.addEventListener('click', prevHighlightsSlide);

    const onHighlightsResize = () => {
      if (highlightsTrack && highlightsSlides.length) {
        highlightsIndex = 0;
        setHighlightsSlideWidth();
        updateHighlightsSlider();
      }
    };
    if (highlightsTrack && highlightsSlides.length) {
      setHighlightsSlideWidth();
      updateHighlightsSlider();
      window.addEventListener('resize', onHighlightsResize);
    }

    document.getElementById('callback-form')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('modal-contact-form')?.addEventListener('submit', handleModalFormSubmit);
    document.getElementById('open-contact-modal-btn')?.addEventListener('click', openContactModal);
    document.getElementById('close-contact-modal-btn')?.addEventListener('click', closeContactModal);

    const modalEl = document.getElementById('contactModal');
    const onModalBackdropClick = (e) => {
      if (e.target === modalEl) closeContactModal();
    };
    modalEl?.addEventListener('click', onModalBackdropClick);

    function onEscape(e) {
      if (e.key === 'Escape') closeContactModal();
    }
    document.addEventListener('keydown', onEscape);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('scroll', handleNavbarScroll);
      document.removeEventListener('keydown', onEscape);
      if (slideInterval) clearInterval(slideInterval);
      document.getElementById('callback-form')?.removeEventListener('submit', handleFormSubmit);
      document.getElementById('modal-contact-form')?.removeEventListener('submit', handleModalFormSubmit);
      document.getElementById('open-contact-modal-btn')?.removeEventListener('click', openContactModal);
      document.getElementById('close-contact-modal-btn')?.removeEventListener('click', closeContactModal);
      modalEl?.removeEventListener('click', onModalBackdropClick);
      window.removeEventListener('resize', onHighlightsResize);
    };
  }, [sheetName]);

  return (
       
           <main className="antialiased overflow-x-hidden min-w-0">

{/* Desktop Header */}
<nav id="navbar"
    className="navbar-desktop w-full fixed top-0 z-50 justify-between items-center px-4 xl:px-6 py-2 lg:py-5 transition-all duration-300 bg-transparent">
    <div className="w-full max-w-7xl mx-auto md:w-[668px] lg:w-full flex justify-between  items-center">
        <div className="flex items-center">
            <a href="#" className="block"><img src="/eldeco-imgs/images/logo-01 1.png" alt="Eldeco"
                    className="h-[38px] lg:h-[38px] w-[213px] object-contain mt-2" /></a>
        </div>
        <div className="flex justify-between items-center gap-4 xl:gap-4 2xl:gap-3">
            <ul className="flex justify-between gap-0.5 xl:gap-8 items-center">
                <li><a href="#home"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="home">Home</a></li>
                <li><a href="#overview"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="overview">Overview</a></li>
                <li><a href="#highlights"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="highlights">Highlights</a></li>
                <li><a href="#amenities"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="amenities">Amenities</a></li>
                <li><a href="#specifications"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="specifications">Specifications</a></li>
                <li><a href="#location"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="location">Location</a></li>
                <li><a href="#eldeco-group"
                        className="nav-link block px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] 2xl:text-[16px] font-[700] text-white hover:text-[#2ecc71] transition-colors font-opensans"
                        data-nav="eldeco-group">Eldeco Group</a></li>
            </ul>
            <a href="#contact"
                className="btn-enquire ml-2 px-4 xl:px-5 py-2 xl:py-2.5 rounded-[25px] text-white text-[13px] xl:text-[14px] font-[700] hover:bg-[#A0522D] transition-colors font-montserrat shrink-0">Contact</a>
        </div>
    </div>
</nav>

{/* Mobile / Tablet Header */}
<nav id="mobile-navbar"
    className="navbar-mobile w-full fixed top-0 z-50 flex justify-between items-center px-3 xs:px-4 sm:px-4 py-2.5 xs:py-3 transition-all duration-300 bg-transparent">
    <a href="#" className="block"><img src="/eldeco-imgs/images/logo-01 1.png" alt="Eldeco"
            className="h-9 xs:h-10 sm:h-12 w-auto max-w-[100px] xs:max-w-[110px] sm:max-w-[130px] object-contain" /></a>
    <button id="menu-toggle" className="z-50 p-1.5 xs:p-2 cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Toggle menu">
        <svg id="menu-icon" className="w-7 h-7 xs:w-8 xs:h-8 text-white" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16">
            </path>
        </svg>
        <svg id="close-icon" className="w-7 h-7 xs:w-8 xs:h-8 text-white hidden" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>
</nav>

{/* Mobile Menu Overlay */}
<div id="mobile-menu"
    className="lg:hidden fixed top-0 left-0 w-full h-screen bg-[#111] z-40 opacity-0 pointer-events-none transition-opacity duration-300">
    <div className="w-full h-full flex flex-col items-center justify-center px-4 xs:px-6 pt-12 xs:pt-16">
        <ul className="flex flex-col items-center w-full max-w-sm">
            <li className="w-full text-center border-b border-white/20"><a href="#home"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Home</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#overview"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Overview</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#highlights"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Highlights</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#amenities"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Amenities</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#specifications"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Specifications</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#location"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Location</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#eldeco-group"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-white text-[15px] xs:text-[16px] font-[700]">Eldeco
                    Group</a>
            </li>
            <li className="w-full text-center border-b border-white/20"><a href="#contact"
                    className="mobile-nav-link block w-full py-3.5 xs:py-4 text-[#2ecc71] text-[15px] xs:text-[16px] font-[700]">Contact</a>
            </li>
        </ul>
    </div>
</div>

{/* Main Content */}
<main className="w-full min-w-0 overflow-x-hidden">
    {/* Hero Section */}
    <section id="home" className="w-full relative overflow-hidden ">
        {/* Slider Container */}
        <div className="banner-slider-container absolute inset-0 z-0">
            <div className="banner-slider-wrapper flex relative transition-transform duration-500 ease-out"
                style={{ width: '300%', height: '100%' }}>
                <div className="banner-slide w-1/3 h-full shrink-0">
                    <img src="/eldeco-imgs/img/sl-phone.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-mobile w-full h-full object-cover" />

                    <img src="/eldeco-imgs/images/sl1.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-desktop w-full h-full object-cover" />
                </div>
                <div className="banner-slide w-1/3 h-full shrink-0">
                    <img src="/eldeco-imgs/img/sl-phone2.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-mobile w-full h-full object-cover" />

                    <img src="/eldeco-imgs/images/sl2.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-desktop w-full h-full object-cover" />
                </div>
                <div className="banner-slide w-1/3 h-full shrink-0">
                    <img src="/eldeco-imgs/img/sl-phone3.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-mobile w-full h-full object-cover" />

                    <img src="/eldeco-imgs/images/sl3.jpg" alt="Oxy-Rich Luxury Residences"
                        className="banner-slide-img-desktop w-full h-full object-cover" />
                </div>
            </div>
        </div>


        <div
            className="rera-qr-container absolute top-16 xs:top-20 sm:top-[105px] right-[1.5rem]  md:right-8 lg:right-8 xl:right-8 z-20 flex flex-row items-start gap-1.5 xs:gap-2 sm:gap-3">
            <div className="w-full max-w-full flex flex-col gap-0.5 xs:gap-1 ">
                <div
                    className="rera-qr-text text-white font-opensans text-left rera-text-mobile flex flex-row gap-1.5 xs:gap-2 sm:gap-2 justify-end text-end">
                    <p className="font-[600] text-[8px] leading-tight">UP RERA REG NO.:
                        UPRERAPRJ106523/01/2026<br />WEBSITE:
                        WWW.UP-RERA.IN<br />LAUNCH DATE: 28TH JANUARY, 2026</p>
                    <div
                        className="rera-qr-img-wrapper bg-white flex items-center justify-center h-[35px] w-[35px] xs:h-[38px] xs:w-[38px] sm:h-[43px] sm:w-[43px] shrink-0">
                        <img src="/eldeco-imgs/images/Qr-code.jpg" alt="QR Code"
                            className="rera-qr-img w-[28px] h-[28px] xs:w-[30px] xs:h-[30px] sm:w-[35px] sm:h-[35px]" />
                    </div>
                </div>

                <div
                    className="rera-qr-text text-white font-opensans text-left rera-text-mobile flex flex-row gap-1.5 xs:gap-2 sm:gap-2 justify-end text-end">
                    <p className="font-[600] text-[8px] leading-tight">ELDECO HOMES
                        DEVELOPERS LTD-COLL A/C<br />
                        FOR ELDECO 7 PEAKS RESIDENCES-ESC<br />
                        HDFC BANK, BANK ACCOUNT NO.: 57500001893798<br />
                        IFSC CODE: HDFC0002830</p>
                </div>
            </div>
        </div>
        {/* Hero Content */}
        <div
            className="relative z-10 w-full h-full min-h-screen flex flex-col justify-end pb-20 xs:pb-24 sm:pb-28 md:pb-16 lg:pb-20 px-3 xs:px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 pt-24 xs:pt-28 sm:pt-32 md:pt-36 2xl:mx-auto 2xl:pl-0 max-w-7xl">
            {/* QR Code & RERA Info (Top Right) */}

            <div className="max-w-2xl w-full">
                <h1
                    className="font-montserrat text-white text-[24px] xs:text-[28px] sm:text-[40px] md:text-[48px] lg:text-[47px] font-bold leading-tight tracking-tight mb-2 xs:mb-3">
                    OXY-RICH<br /><span
                        className="text-[20px] xs:text-[24px] sm:text-[36px] md:text-[44px] lg:text-[47px] font-normal">LUXURY
                        RESIDENCES</span>
                </h1>
                <p
                    className="font-montserrat text-white text-[12px] xs:text-[13px] sm:text-[15px] md:text-[16px] lg:text-[22px] flex items-center gap-1.5 xs:gap-2 mb-4 xs:mb-5 sm:mb-6 font-bold">
                    <img src="/eldeco-imgs/images/location_eldeco.svg" alt="Location" className="w-3.5 h-3.5 xs:w-4 xs:h-4 shrink-0" />
                    Omicron 1A, <span className="font-normal">Gr. Noida</span>
                </p>
                <div
                    className="flex gap-2 xs:gap-3 sm:gap-3 md:gap-2 mb-5 xs:mb-6 sm:mb-8 hero-info-cards max-w-full justify-start sm:justify-start">
                    <div
                        className="hero-info-card hero-info-card-sizes rounded-[100px] w-[110px] md:min-w-[200px] h-[52px] md:h-[75px] flex flex-col justify-center items-center px-1.5 sm:-ml-2 md:-ml-4 z-10 shrink-0 shadow-md">
                        <p className="font-montserrat text-white text-[10px] md:text-[16px] font-[600] leading-tight">
                            Sizes</p>
                        <p className="font-montserrat text-white text-[11px] md:text-[20px] font-bold leading-tight">
                            3 BHK & 4 BHK</p>
                    </div>
                    <div
                        className="hero-info-card rounded-[100px] w-[110px] md:min-w-[200px] h-[52px] md:h-[75px] flex flex-col justify-center items-center px-1.5 border-2 border-white sm:-ml-2 md:-ml-4 shrink-0 shadow-md bg-white/10">
                        <p className="font-montserrat text-white text-[10px] md:text-[16px] font-[500] leading-tight">
                            Starting Price</p>
                        <p className="font-montserrat text-white text-[11px]  md:text-[20px] font-bold leading-tight">
                            ₹ 2.20 Cr*</p>
                    </div>
                </div>
            </div>
        </div>

        {/* <!--     Enquire Now Button - Centered, full w  idth on mobile --> */}
        <button type="button" id="open-contact-modal-btn"
            className="w-[240px] xs:w-[260px] sm:w-[280px] flex justify-between items-center bg-gradient-to-r from-[#976431] to-[#b28254] px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-tl-[4px] rounded-bl-[4px] cursor-pointer fixed right-0 bottom-0 z-20 hover:opacity-90 transition-opacity">
            <span
                className="text-white font-montserrat font-[700] text-[12px] xs:text-[13px] sm:text-[14px] md:text-[16px]">Enquiry
                Now</span>
            <img src="/eldeco-imgs/images/arrow.svg" alt="Arrow Right"
                className="w-4 h-4 xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5 rotate-40 shrink-0" />
        </button>

        {/* <!-- Slider Pagination Dots --> */}
        <div
            className="absolute bottom-12 xs:bottom-14 sm:bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 xs:gap-2">
            <div className="banner-pagination-dot w-8 xs:w-9 sm:w-10 md:w-[58px] h-0.5 xs:h-1 rounded-full bg-white cursor-pointer hover:bg-white/80 transition-colors"
                data-slide="0"></div>
            <div className="banner-pagination-dot w-8 xs:w-9 sm:w-10 md:w-[58px] h-0.5 xs:h-1 rounded-full bg-white/50 cursor-pointer hover:bg-white/70 transition-colors"
                data-slide="1">
            </div>
            <div className="banner-pagination-dot w-8 xs:w-9 sm:w-10 md:w-[58px] h-0.5 xs:h-1 rounded-full bg-white/50 cursor-pointer hover:bg-white/70 transition-colors"
                data-slide="2">
            </div>
        </div>
    </section>

    {/* <!-- Overview Section --> */}
    <section id="overview"
        className="w-full bg-white overflow-hidden border-b-[1px] border-[#F5C99E] py-[35px] lg:py-[70px] px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto md:w-[668px] lg:w-full">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-[2%] xl:gap-10">

                {/* <!-- LEFT --> */}
                <div
                    className="order-1 flex flex-col gap-5 xs:gap-6 lg:gap-8 w-full lg:flex-[1_1_0%] lg:min-w-0 text-center lg:text-start">

                    <div>
                        <p
                            className="text-[#A27140] text-[12px] xs:text-[13px] font-semibold uppercase mb-3 xs:mb-4 font-opensans">
                            Overview
                        </p>

                        <h2
                            className="text-[#000000] text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-[30px] font-bold leading-[1.25] mb-4 xs:mb-5 sm:mb-6 font-montserrat w-full lg:max-w-[90%] xl:max-w-[714px]">
                            Gateway to Higher Living, Inspired by Nature.
                        </h2>

                        <p
                            className="text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] md:text-base leading-[1.7] font-opensans w-full lg:max-w-[95%] xl:max-w-[929px]">
                            Eldeco Group, one of the top real estate developers in North India, is thrilled to
                            announce the launch of Eldeco 7 Peaks Residences, a community that includes luxurious 3
                            & 4 BHK residences in Greater Noida, more particularly within Omicron 1A. The Eldeco 7
                            Peaks project represents a combination of premium quality construction, modern-day
                            design and peaceful living. The Eldeco Group&apos;s commitment to trust, creativity and
                            innovation is firmly established through its willingness to provide the absolute best in
                            real estate development for our clients
                        </p>
                    </div>

                    <div
                        className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-[2%] xl:gap-[3%] items-start">

                        <div
                            className="flex flex-col gap-5 xs:gap-6 w-full lg:flex-[0_0_45%] lg:max-w-[45%] xl:flex-[0_0_423px] xl:max-w-[423px]">
                            <p
                                className="text-[#000000] text-[13px] xs:text-[14px] sm:text-[16px] md:text-base leading-[1.7] font-opensans font-normal">
                                Situated in a serene area where architecture blends in seamlessly with the
                                surrounding natural beauty, and vast oxygen-rich green belts with well-developed
                                highways. Inspired by the world&apos;s seven peaks, the Eldeco Group 7 Peaks Residences
                                were created with grand double-height entrances, lots of outdoor space, and striking
                                entry points; every element conveys luxury even before you enter the structure.

                            </p>

                            <div>

                                <div
                                    className="overview-property-card rounded-[5px] p-5 xs:p-6 md:p-8 mb-5 xs:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-6 sm:gap-8">
                                    <div>
                                        <p
                                            className="text-[#000000] text-xl xs:text-2xl sm:text-[30px] font-semibold font-montserrat">
                                            3 & 4 BHK</p>
                                        <p className="text-[#000000] text-[14px] xs:text-[16px] font-opensans mt-1">
                                            Oxy-Rich Luxury
                                            Residences</p>
                                    </div>

                                    <div
                                        className="flex items-start gap-1 justify-center text-center md:text-left md:justify-start ">
                                        <img src="/eldeco-imgs/images/brown_location.svg" className="w-[15px] mt-0.5 shrink-0" />
                                        <div>
                                            <p
                                                className="text-[#976431] text-[10px] xs:text-[11px] font-semibold uppercase tracking-[0.15em] font-montserrat">
                                                Prime Location</p>
                                            <p
                                                className="text-[#000000] text-lg xs:text-xl sm:text-[23px] font-semibold font-montserrat mt-1">
                                                Omicron 1A,</p>
                                            <p
                                                className="text-[#000000] text-xl xs:text-[23px] font-normal font-montserrat mb-[-10px]">
                                                Gr. Noida</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 xs:gap-4">
                                    <a href="#"
                                        className="btn-overview-solid inline-flex items-center justify-center gap-2 text-white font-montserrat font-semibold text-[12px] lg:text-[11px] xl:text-[14px] py-2.5 xs:py-3 sm:py-3.5 rounded-[5px] transition-all hover:opacity-95 shadow-sm xl:min-h-[44px]  w-full px-4">
                                        Download Brochure
                                        <img src="/eldeco-imgs/images/Download.svg"
                                            className="w-[18px] h-[18px] xs:w-[20px] xs:h-[20px]" />
                                    </a>

                                    <a href="#contact"
                                        className="inline-flex items-center justify-center gap-2 text-[#000000] font-montserrat font-semibold text-[12px] lg:text-[11px] xl:text-[14px] py-2.5 xs:py-3 sm:py-3.5 rounded-[5px] border border-[#A27140] bg-white transition-all hover:bg-[#976431]/5 xl:min-h-[44px]  w-full px-4">
                                        Connect with us
                                        <img src="/eldeco-imgs/images/rotate_arrow.svg"
                                            className="w-[17px] h-[17px] xs:w-[19px] xs:h-[19px] rotate-40 ml-[6px]" />
                                    </a>
                                </div>

                            </div>
                        </div>

                        <div
                            className="rounded-[5px] overflow-hidden w-full lg:flex-[0_0_48%] lg:max-w-[48%] xl:flex-[0_0_544px] xl:max-w-[544px] h-auto lg:h-full shrink-0">
                            <img src="/eldeco-imgs/images/house.jpg" className="w-full h-full object-cover" />
                        </div>

                    </div>
                </div>

                {/* <!-- RIGHT --> */}
                <div
                    className="order-2 lg:order-2 overview-right-col flex md:flex-row flex-col lg:flex-col gap-6 xs:gap-8 sm:gap-10 lg:gap-6 xl:gap-8 items-center justify-between w-full lg:flex-[0_0_18%] lg:max-w-[18%] xl:flex-[0_0_238px] xl:max-w-[238px]">
                    <div
                        className="w-full   md:max-w-[40%] lg:max-w-[100%] xl:max-w-[238px]   rounded-[5px] overflow-hidden mx-auto  px-0  ">
                        <img src="/eldeco-imgs/images/city.jpg" alt="City Skyline"
                            className="w-full h-full object-cover rounded-[5px]" />
                    </div>
                    <div className="w-full md:max-w-[45%] lg:max-w-[85%] xl:max-w-[238px] 
                               grid  grid-cols-2 gap-4 xs:gap-6 
                               items-center justify-between text-center flex-wrap lg:flex-nowrap lg:flex lg:flex-col 
                               px-2 sm:px-4 md:px-0">

                        <div className="overview-stat text-center">
                            <p
                                className="text-gray-900 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat">
                                8
                            </p>
                            <p className="text-[#000000] text-[12px] xs:text-[14px] sm:text-[16px] font-opensans">Acres
                                Prime Land</p>
                            <div
                                className="overview-stat-line w-12 xs:w-16 sm:w-[80%] lg:w-[90%] xl:w-[220px] h-[1px] my-1.5 xs:my-2 mx-auto">
                            </div>
                        </div>

                        <div className="overview-stat text-center">
                            <p
                                className="text-gray-900 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat">
                                7
                            </p>
                            <p className="text-[#000000] text-[12px] xs:text-[14px] lg:text-[16px] font-opensans">Iconic
                                Towers</p>
                            <div
                                className="overview-stat-line w-12 xs:w-16 sm:w-[80%] lg:w-[90%] xl:w-[220px] h-[1px] my-1.5 xs:my-2 mx-auto">
                            </div>
                        </div>

                        <div className="overview-stat text-center">
                            <p
                                className="text-gray-900 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat">
                                35
                            </p>
                            <p className="text-[#000000] text-[12px] xs:text-[14px] lg:text-[16px] font-opensans">
                                Storeys Each</p>
                            <div
                                className="overview-stat-line w-12 xs:w-16 sm:w-[80%] lg:w-[90%] xl:w-[220px] h-[1px] my-1.5 xs:my-2 mx-auto">
                            </div>
                        </div>

                        <div className="overview-stat text-center">
                            <p
                                className="text-gray-900 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat">
                                4
                            </p>
                            <p className="text-[#000000] text-[12px] xs:text-[14px] lg:text-[16px] font-opensans">
                                Apartments per Core
                            </p>
                            <div
                                className="overview-stat-line w-12 xs:w-16 sm:w-[80%] lg:w-[90%] xl:w-[220px] h-[1px] mx-auto mt-2 xs:mt-[10px]">
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </section>


    {/* <!-- Highlights Section --> */}
    <section id="highlights"
        className="w-full bg-white border-b-[1px] border-[#F5C99E] overflow-hidden px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 py-[35px] lg:py-[70px]">
        <h2
            className="text-center text-[#000000] text-xl xs:text-2xl sm:text-3xl md:text-3xl font-bold font-montserrat mb-6 ">
            Highlights</h2>
        <div className="max-w-7xl mx-auto relative  md:w-[668px] lg:w-full">
            <div className="highlights-slider w-full min-w-0 2xl:overflow-hidden">
                <div
                    className="highlights-track flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {/* <!-- Slide 1 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Oxy-rich-green-surroundings.jpg" alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Oxy-rich green surroundings.
                        </p>
                    </div>
                    {/* <!-- Slide 2 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Open-&-unobstructed-skyline-views.jpg"
                                alt="Double-heighted, air-conditioned lobbies"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-[14px] text-center lg:text-start xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Open & unobstructed skyline views.

                        </p>
                    </div>
                    {/* <!-- Slide 3 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Double--heighted,-air-conditioned-lobbies.jpg"
                                alt="Sunlit canopies & natural surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Double- heighted, air-conditioned lobbies.

                        </p>
                    </div>
                    {/* <!-- Slide 4 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Premium-balconies-with-panoramic-green-views.jpg"
                                alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Premium balconies with panoramic green views.
                        </p>
                    </div>
                    {/* <!-- Slide 5 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Sunlit-canopies-&-nature---filled-environmen.jpg"
                                alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Sunlit canopies & nature - filled environment.
                        </p>
                    </div>
                    {/* <!-- Slide 6 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Iconic-towers-inspired-by-7-peaks.jpg" alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Iconic towers inspired by 7 peaks

                        </p>
                    </div>

                    {/* <!-- Slide 6 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Bright,-&-well-ventilated-living-spaces.jpg"
                                alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Bright, & well-ventilated living spaces..

                        </p>
                    </div>


                    {/* <!-- Slide 6 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Nature-integrated-layout.jpg" alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Nature integrated layout

                        </p>
                    </div>

                    {/* <!-- Slide 6 --> */}
                    <div className="highlights-slide shrink-0 highlights-slide-width">
                        <div className="rounded-[5px] overflow-hidden mb-3 xs:mb-4">
                            <img src="/eldeco-imgs/img/Elevated,-serene,-&-low-density-living.jpg"
                                alt="Oxy-rich green surroundings"
                                className="w-full h-auto aspect-[513/314] object-cover xl:w-[513px] xl:h-[314px]" />
                        </div>
                        <p
                            className="text-[#000000] text-center lg:text-start text-[14px] xs:text-[16px] sm:text-[18px] md:text-[20px] font-[600] font-opensans leading-tight">
                            Elevated, serene, & low density living.

                        </p>
                    </div>
                </div>
            </div>
            {/* <!-- Slider Previous Button (Left) --> */}
            <button type="button" id="highlights-prev"
                className="highlights-nav absolute left-0 top-1/2 -translate-y-1/2 translate-x-1 xs:translate-x-2 sm:translate-x-4 lg:-translate-x-5 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 z-10 rotate-180"
                aria-label="Previous slide">
                <img src="/eldeco-imgs/images/slider.svg" alt="" className="w-4 h-4 xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5" />
            </button>
            {/* <!-- Slider Next Button (Right) --> */}
            <button type="button" id="highlights-next"
                className="highlights-nav absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1 xs:-translate-x-2 sm:-translate-x-4 lg:translate-x-5 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 z-10"
                aria-label="Next slide">
                <img src="/eldeco-imgs/images/slider.svg" alt="" className="w-4 h-4 xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5" />
            </button>
        </div>
    </section>

    {/* <!-- Amenities Section --> */}
    <section id="amenities"
        className="w-full hidden bg-white overflow-hidden px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 py-10 xs:py-12 sm:py-14">
        <h2
            className="text-center text-[#000] text-2xl xs:text-3xl sm:text-[32px] md:text-[36px] lg:text-[36px] font-bold font-montserrat mb-8 xs:mb-10 sm:mb-12">
            Amenities
        </h2>

        <div className="max-w-7xl mx-auto min-w-0">

            {/* <!-- TOP GRID --> */}
            <div
                className="flex flex-col sm:flex-row gap-4 xs:gap-5 sm:gap-6 lg:gap-[2%] xl:gap-6 mb-5 xs:mb-6 lg:mb-6 items-stretch max-w-full min-w-0">

                {/* <!-- Kids Play Area --> */}
                <div
                    className="rounded-lg overflow-hidden sm:row-span-2 w-full sm:flex-[0_0_40%] md:flex-[0_0_42%] lg:flex-[0_0_42%] xl:flex-[0_0_499px] xl:max-w-[499px] min-w-0 flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                        <img src="/eldeco-imgs/images/Kids Play Area.jpg" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <p
                        className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-semibold font-montserrat border border-[#FADEC3] rounded-md py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                        Kids Play Area
                    </p>
                </div>

                <div
                    className="flex flex-col justify-between gap-6 w-full sm:flex-[0_0_28%] md:flex-[0_0_30%] lg:flex-[0_0_30%] xl:flex-[0_0_498px] xl:max-w-[498px] min-w-0 h-full">
                    {/* <!-- CCTV --> */}
                    <div className="w-full max-w-full md:ml-0 flex-1 flex flex-col">
                        <div
                            className="flex-1 overflow-hidden h-[100px] xs:h-[120px] sm:h-[140px] md:h-[160px] lg:h-auto">
                            <img src="/eldeco-imgs/images/Mask group (4).jpg" className="w-full h-full object-cover rounded-md" />
                        </div>
                        <p
                            className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-semibold font-montserrat border border-[#FADEC3] rounded-md py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                            CCTV Security
                        </p>
                    </div>

                    {/* <!-- Courtyard Garden --> */}
                    <div className="w-full max-w-full md:ml-0 flex-1 flex flex-col">
                        <div
                            className="flex-1 overflow-hidden h-[100px] xs:h-[120px] sm:h-[140px] md:h-[160px] lg:h-auto">
                            <img src="/eldeco-imgs/images/Mask group (5).jpg" className="w-full h-full object-cover rounded-md" />
                        </div>
                        <p
                            className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-semibold font-montserrat border border-[#FADEC3] rounded-[5px] py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                            Courtyard Garden
                        </p>
                    </div>
                </div>

                {/* <!-- Cycling Track --> */}
                <div
                    className="rounded-lg overflow-hidden sm:row-span-2 w-full sm:flex-[0_0_28%] md:flex-[0_0_25%] lg:flex-[0_0_25%] xl:flex-[0_0_209px] xl:max-w-[209px] min-w-0 flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                        <img src="/eldeco-imgs/images/cycling-track.jpg" className="w-full h-full object-cover" />
                    </div>
                    <button
                        className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] w-full font-medium font-opensans border border-[#FADEC3] rounded-md py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                        Cycling Track
                    </button>
                </div>


            </div>

            {/* <!-- BOTTOM GRID --> */}
            <div
                className="flex flex-col sm:flex-row gap-4 xs:gap-5 sm:gap-6 lg:gap-[2%] xl:gap-6 mb-4 rounded-[5px] max-w-full items-stretch min-w-0">

                <div
                    className="rounded-lg overflow-hidden w-full sm:flex-[0_0_30%] md:flex-[0_0_32%] lg:flex-[0_0_30%] xl:flex-[0_0_347px] xl:max-w-[347px] min-w-0 flex flex-col">
                    <div className=" overflow-hidden h-[180px] xs:h-[200px] sm:h-[220px] md:h-auto">
                        <img src="/eldeco-imgs/images/Mask group (6).jpg" className="w-full h-full object-cover" />
                    </div>
                    <p
                        className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-[600] font-opensans border border-[#FADEC3] rounded-[5px] py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                        Reflexology Path
                    </p>
                </div>

                <div
                    className="rounded-lg overflow-hidden w-full sm:flex-[0_0_38%] md:flex-[0_0_40%] lg:flex-[0_0_40%] xl:flex-[0_0_512px] xl:max-w-[512px] min-w-0 flex flex-col">
                    <div className=" overflow-hidden h-[180px] xs:h-[200px] sm:h-[220px] md:h-auto">
                        <img src="/eldeco-imgs/images/Bonfire-Fit 1.jpg" className="w-full h-full object-cover" />
                    </div>
                    <p
                        className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-[600] font-opensans border border-[#FADEC3] rounded-[5px] py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                        Bonfire-Fit
                    </p>
                </div>

                <div
                    className="rounded-[5px] overflow-hidden w-full sm:flex-[0_0_30%] md:flex-[0_0_32%] lg:flex-[0_0_30%] xl:flex-[0_0_347px] xl:max-w-[347px] min-w-0 flex flex-col">
                    <div className=" overflow-hidden h-[180px] xs:h-[200px] sm:h-[220px] md:h-auto">
                        <img src="/eldeco-imgs/images/Yoga-&-Meditation-Zone 1.jpg" className="w-full h-full object-cover" />
                    </div>
                    <p
                        className="text-center text-[14px] xs:text-[15px] sm:text-[16px] lg:text-[16px] font-[600] font-opensans border border-[#FADEC3] rounded-[5px] py-2.5 xs:py-3 lg:py-3 mt-2 xs:mt-3 lg:mt-3">
                        Yoga & Meditation Zone
                    </p>
                </div>

            </div>

            {/* <!-- CTA --> */}
            <div className="flex justify-center">
                <a href="#"
                    className="btn-enquire inline-flex items-center gap-2 text-white font-montserrat font-semibold text-xs xs:text-sm lg:text-sm px-6 xs:px-8 lg:px-8 py-2.5 xs:py-3 lg:py-3 rounded-lg hover:opacity-95 shadow-sm">
                    Click for more amenities
                    <svg className="w-4 h-4 xs:w-5 xs:h-5 lg:w-5 lg:h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>

        </div>
    </section>


    {/* <!-- New Amenities Section  --> */}

    <section
        className="w-full flex justify-center items-center px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 py-10 xs:py-12 sm:py-14">
        {/* <!-- Center Align Container  --> */}
        <div className="w-full flex flex-col max-w-7xl  text-center gap-6 justify-center items-center">
            <h2 className="font-[700] text-[36px]">Amenities</h2>
            <div className="flex flex-col gap-4 md:gap-[20px]">
                {/* <!-- Row 1  --> */}
                <div
                    className="w-full flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6 md:w-[668px] lg:w-full">
                    {/* <!-- Col 1  --> */}
                    <div
                        className="w-full md:w-[341px] lg:w-[380px] xl:w-[499px] md:h-[287px] lg:h-auto xl:h-[471px] flex flex-col justify-between gap-[10px] min-h-[260px] md:min-h-0">
                        <div className="flex-1 overflow-hidden md:flex-none">
                            <img src="/eldeco-imgs/images/kids-play2.jpg" alt=""
                                className="w-full h-full md:h-auto object-cover md:object-contain" />
                        </div>

                        <button
                            className="font-[600] text-[13px] lg:text-[16px] h-[40px] lg:h-[50px] w-full border border-[#FADEC3] cursor-pointer rounded-[5px]">Kids
                            Play Area</button>
                    </div>

                    {/* <!-- Col 2  --> */}
                    <div
                        className="w-full md:w-[317px] flex flex-col gap-[15px] justify-between lg:w-[380px] xl:w-[498px] lg:h-[160px] xl:h-[471px] min-h-[260px] md:min-h-0">
                        {/* <!-- Div 1  --> */}
                        <div className="flex flex-col w-full gap-[10px] justify-between flex-1 md:flex-none">
                            <div className="flex-1 overflow-hidden md:flex-none md:h-auto">
                                <img src="/eldeco-imgs/images/cctv2.jpg" alt=""
                                    className="w-full h-full md:h-auto lg:h-[123px] xl:h-[166px] object-cover md:object-contain" />
                            </div>

                            <button
                                className="font-[600] text-[13px] lg:text-[16px] h-[40px] lg:h-[50px] w-full border border-[#FADEC3] cursor-pointer rounded-[5px]">CCTV
                                Security</button>
                        </div>

                        {/* <!-- Div 2  --> */}
                        <div className="flex flex-col w-full gap-[10px] justify-between flex-1 md:flex-none">
                            <div className="flex-1 overflow-hidden md:flex-none md:h-auto">
                                <img src="/eldeco-imgs/images/kotyyard2.jpg" alt=""
                                    className="w-full h-full md:h-auto lg:h-[123px] xl:h-[166px] object-cover md:object-contain" />
                            </div>

                            <button
                                className="font-[600] text-[13px] lg:text-[16px] h-[40px] lg:h-[50px] w-full border border-[#FADEC3] cursor-pointer rounded-[5px]">Courtyard
                                Garden</button>
                        </div>
                    </div>

                    {/* <!-- Col 3  --> */}
                    <div
                        className="w-full md:w-auto xl:w-[209px] md:w-[381px] lg:h-auto lg:w-auto xl:h-[471px] flex flex-col justify-between gap-[10px] min-h-[260px] md:min-h-0">
                        <div className="flex-1 overflow-hidden md:flex-none">
                            <img src="/eldeco-imgs/images/cctv3.jpg" alt=""
                                className="w-full h-full md:h-[236px] lg:h-[326px] xl:h-[419px] object-cover" />
                        </div>

                        <button
                            className="font-[600] text-[13px] lg:text-[16px] h-[40px] lg:h-[50px] w-full border border-[#FADEC3] cursor-pointer rounded-[5px]">Cycling
                            Track</button>
                    </div>
                </div>

                {/* <!-- Row 2  --> */}
                <div
                    className="w-full flex flex-col md:flex-row md:justify-between gap-4 md:gap-6 md:w-[668px] lg:w-full">
                    {/* <!-- Col 1  --> */}
                    <div
                        className="w-full md:w-auto xl:w-[347px] xl:h-[318px] gap-[10px] flex flex-col justify-between min-h-[220px] md:min-h-0 xl:justify-between">
                        <div className="flex-1 overflow-hidden md:flex-none">
                            <img src="/eldeco-imgs/images/path.jpg" alt=""
                                className="w-full h-full md:h-auto object-cover md:object-contain" />
                        </div>
                        <button
                            className="w-full h-[47px] border border-[#FADEC3] rounded-[5px] font-[600] text-[13px] lg:text-[16px] cursor-pointer">
                            Reflexology Path
                        </button>
                    </div>

                    {/* <!-- Col 2  --> */}
                    <div
                        className="w-full md:w-auto xl:w-[512px] xl:h-[318px] gap-[10px] flex flex-col justify-between min-h-[220px] md:min-h-0 xl:justify-between">
                        <div className="flex-1 overflow-hidden md:flex-none">
                            <img src="/eldeco-imgs/images/fit.jpg" alt=""
                                className="w-full h-full md:h-auto object-cover md:object-contain" />
                        </div>
                        <button
                            className="w-full h-[47px] border border-[#FADEC3] rounded-[5px] font-[600] text-[13px] lg:text-[16px] cursor-pointer">
                            Bonfire-Fit
                        </button>
                    </div>


                    {/* <!-- Col 3  --> */}
                    <div
                        className="w-full md:w-auto xl:w-[347px] xl:h-[318px] gap-[10px] flex flex-col justify-between min-h-[220px] md:min-h-0 xl:justify-between">
                        <div className="flex-1 overflow-hidden md:flex-none">
                            <img src="/eldeco-imgs/images/zone.jpg" alt=""
                                className="w-full h-full md:h-auto object-cover md:object-contain" />
                        </div>
                        <button
                            className="w-full h-[47px] border border-[#FADEC3] rounded-[5px] font-[600] text-[13px] lg:text-[16px] cursor-pointer">
                            Yoga & Meditation Zone
                        </button>
                    </div>

                </div>
                <div className="flex justify-center">
                    <a href="#"
                        className="btn-enquire inline-flex items-center gap-2 text-white font-montserrat font-semibold text-xs xs:text-sm lg:text-sm px-6 xs:px-8 lg:px-8 py-2.5 xs:py-3 lg:py-4 rounded-lg hover:opacity-95 shadow-sm">
                        Click for more amenities
                        <svg className="w-4 h-4 xs:w-5 xs:h-5 lg:w-5 lg:h-5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>


    {/* <!-- Apartment Design & Specifications Section --> */}
    <section id="specifications" className="w-full bg-white overflow-hidden px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 ">
        <div className="max-w-7xl mx-auto min-w-0 md:w-[668px] lg:w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start">
                {/* <!-- Left: Tower Image --> */}
                <div
                    className="w-full max-w-full lg:max-w-[622px] h-[220px] xs:h-[260px] sm:h-[320px] md:h-[380px] lg:h-[480px] xl:h-[551px] rounded-[5px] overflow-hidden shrink-0">
                    <img src="/eldeco-imgs/images/tower.jpg" alt="Apartment Towers" className="w-full h-full" />
                </div>
                {/* <!-- Right: Content --> */}
                <div className="flex flex-col">
                    <h2
                        className="text-[#000000] text-2xl xs:text-3xl sm:text-[32px] md:text-[34px] lg:text-[36px] xl:text-[36px] font-bold font-montserrat mb-5 xs:mb-6 sm:mb-7 text-center lg:text-start md:mb-8 lg:mb-8 max-w-full lg:ml-[18px] leading-tight xs:leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[50px]">
                        Apartment Design & <br className="hidden sm:block" />Specifications</h2>
                    <ul
                        className="specifications-list xl:space-y-4 list-none pl-3 xs:pl-4 sm:pl-6 lg:pl-[25px] w-full max-w-full">
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Visual
                                privacy with no two apartments looking into each other</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Large
                                balconies & unobstructed views</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Spacious
                                bedrooms with ample storage and comfortable grooming spaces</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Visual
                                privacy with no two apartments looking into each other</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">All
                                units contain VRV A/C Units</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Imported
                                stone flooring in living / dining / kitchen</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Premium
                                CP fittings & sanitaryware</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">Digital
                                Lock Entrance at entrance</span>
                        </li>
                        <li className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <span className="spec-bullet mt-1.5 xs:mt-2 shrink-0"></span>
                            <span
                                className="font-montserrat font-normal text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] xs:leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#000000]">8
                                ft high doors</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Location Advantage Section --> */}
    <section id="location"
        className="w-full bg-white overflow-hidden px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 py-10 xs:py-12 sm:py-14">
        <div className="max-w-7xl mx-auto min-w-0 md:w-[668px] lg:w-full">
            <h2
                className="text-center text-[#000000] text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold font-montserrat mb-8 xs:mb-10 sm:mb-12">
                Location Advantage</h2>
            <div className="flex flex-col lg:flex-row gap-5 xs:gap-6 sm:gap-6 lg:gap-[2%] xl:gap-8 items-stretch">
                {/* <!-- Left Column - Connectivity & Educational Institutions --> */}
                <div
                    className="flex flex-col justify-between gap-5 xs:gap-6 sm:gap-6 lg:gap-6 order-2 lg:order-1 w-full lg:flex-[0_0_30%] xl:flex-[0_0_383px] xl:max-w-[383px] min-w-0">
                    <div
                        className="location-card rounded-[5px] p-4 xs:p-5 sm:p-6 lg:p-5 xl:p-6 border border-[#FADEC3] w-full max-w-full h-full flex flex-col">
                        <h3
                            className="text-[#000000] text-base xs:text-lg lg:text-lg font-bold font-montserrat mb-3 xs:mb-4 text-center lg:text-left">
                            Connectivity</h3>
                        <ul className="space-y-1.5 xs:space-y-2 list-none pl-0 flex-1">
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Yamuna Expressway - approx. ten minutes</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Noida/Greater Noida Expressway - approx. twenty minutes</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Pari Chowk - approx. eight minutes</span>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="location-card rounded-[5px] p-4 xs:p-5 sm:p-6 lg:p-5 xl:p-10 border border-[#FADEC3] w-full max-w-full h-full flex flex-col">
                        <h3
                            className="text-[#000000] text-base xs:text-lg lg:text-lg font-bold font-montserrat mb-3 xs:mb-4 text-center lg:text-left">
                            Educational Institutions
                        </h3>
                        <ul className="space-y-1.5 xs:space-y-2 list-none pl-0 flex-1">
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>DPS, Greater Noida - 19.4 kms</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Ryan International School - 8.5 kms</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] lg:text-[14px] xl:text-[15px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Cambridge School - approx. 15 minutes</span>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* <!-- Center Column - Map --> */}
                <div
                    className="order-1 lg:order-2 w-full lg:flex-[0_0_38%] xl:flex-[0_0_440px] xl:max-w-[440px] h-[250px] xs:h-[280px] sm:h-[320px] md:h-[380px] lg:h-auto min-w-0">
                    <div className="rounded-[5px] overflow-hidden h-full shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d28060.510347442774!2d77.562706!3d28.462563!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cbff868cf6827%3A0x6a32ae78fa7f9172!2sOmicron%20I%2C%20Greater%20Noida%2C%20Uttar%20Pradesh%20201310!5e0!3m2!1sen!2sin!4v1772882494247!5m2!1sen!2sin"
                            className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Omicron I, Greater Noida Map"></iframe>
                    </div>
                </div>
                {/* <!-- Right Column - Health Care & Retail and Leisure --> */}
                <div
                    className="flex flex-col gap-5 xs:gap-6 sm:gap-6 lg:gap-6 order-3 w-full lg:flex-[0_0_30%] xl:flex-[0_0_auto] xl:max-w-[383px] min-w-0">
                    <div
                        className="location-card rounded-[5px] p-4 xs:p-5 sm:p-6 lg:p-5 xl:p-8 border border-[#FADEC3] w-full max-w-full h-full flex flex-col">
                        <h3
                            className="text-[#000000] text-base xs:text-lg lg:text-lg font-bold font-montserrat mb-3 xs:mb-4 text-center lg:text-left">
                            Health Care</h3>
                        <ul className="space-y-1.5 xs:space-y-2 list-none pl-0 flex-1">
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Yatharth Hospital - 9.1 kms</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Fortis Hospital - around twenty minutes</span>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="location-card rounded-[5px] p-4 xs:p-5 sm:p-6 lg:p-5 xl:p-6 border border-[#FADEC3] w-full max-w-full h-full flex flex-col">
                        <h3
                            className="text-[#000000] text-base xs:text-lg lg:text-lg font-bold font-montserrat mb-3 xs:mb-4 text-center lg:text-left">
                            Retail and Leisure</h3>
                        <ul className="space-y-1.5 xs:space-y-2 list-none pl-0 flex-1">
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>Grand Venice Mall - around ten <br className="hidden sm:block" />minutes</span>
                            </li>
                            <li
                                className="flex items-start gap-2 font-opensans text-[#000000] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] leading-relaxed">
                                <span className="location-bullet mt-1.5 shrink-0"></span>
                                <span>MSX Mall - approx. eight minutes</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- About Eldeco Group Section --> */}
    <section id="eldeco-group"
        className="w-full bg-white overflow-hidden px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16 py-[35px]">
        <div className="max-w-7xl mx-auto text-center mb-8 xs:mb-10 sm:mb-12 md:w-[668px] lg:w-full">
            <h2
                className="text-[#000000] text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold font-montserrat mb-4 xs:mb-5 sm:mb-6">
                About Eldeco
                group</h2>
            <p
                className="text-[#000000] text-[14px] xs:text-[15px] sm:text-base md:text-[16px] lg:text-[16px] leading-relaxed font-opensans w-full max-w-[840px] mx-auto px-2">
                With over four decades of expertise, Eldeco has been a pioneer in North India&apos;s real estate
                landscape, known for its residential projects in Noida, Greater Noida and other cities. Having
                successfully delivered 200+ projects across 20+ cities, Eldeco has served over 30000+ satisfied
                homeowners, and developed 60+ million sq.ft.</p>
        </div>
        {/* <!-- Stats block with background image and dark blue overlay --> */}
        <div
            className="w-full max-w-7xl mx-auto relative rounded-[5px] overflow-hidden min-h-[240px] xs:min-h-[280px] sm:min-h-[350px] md:min-h-[400px] lg:h-[522px]">
            <div className="absolute inset-0 z-0">
                <img src="/eldeco-imgs/images/night_city.jpg" alt="Eldeco Cityscape"
                    className="w-full h-full object-cover min-h-[240px] xs:min-h-[280px]" />
            </div>
            <div className="absolute inset-0 z-10"></div>
            <div
                className="relative z-20 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/30 w-full max-w-4xl mx-auto mt-4 xs:mt-5 sm:mt-6 lg:mt-[30px]">
                <div
                    className="eldeco-stat flex-1 py-6 xs:py-7 sm:py-8 px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 text-center">
                    <p className="eldeco-stat-num text-white text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[40px] font-bold font-montserrat mb-1.5 xs:mb-2"
                        data-count="40" data-suffix="+">0+</p>
                    <p className="text-white text-xs xs:text-sm sm:text-base lg:text-sm xl:text-base font-opensans">
                        Years of legacy</p>
                </div>
                <div
                    className="eldeco-stat flex-1 py-6 xs:py-7 sm:py-8 px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 text-center">
                    <p className="eldeco-stat-num text-white text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[40px] font-bold font-montserrat mb-1.5 xs:mb-2"
                        data-count="20" data-suffix="+">0+</p>
                    <p className="text-white text-xs xs:text-sm sm:text-base lg:text-sm xl:text-base font-opensans">
                        Cities</p>
                </div>
                <div
                    className="eldeco-stat flex-1 py-6 xs:py-7 sm:py-8 px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 text-center">
                    <p className="eldeco-stat-num text-white text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[40px] font-bold font-montserrat mb-1.5 xs:mb-2"
                        data-count="200" data-suffix="+">0+</p>
                    <p className="text-white text-xs xs:text-sm sm:text-base lg:text-sm xl:text-base font-opensans">
                        Projects</p>
                </div>
                <div
                    className="eldeco-stat flex-1 py-6 xs:py-7 sm:py-8 px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 text-center">
                    <p className="eldeco-stat-num text-white text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[40px] font-bold font-montserrat mb-1.5 xs:mb-2"
                        data-count="30000" data-suffix="+">0+</p>
                    <p className="text-white text-xs xs:text-sm sm:text-base lg:text-sm xl:text-base font-opensans">
                        Families</p>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Request a Call Back / Contact Section --> */}
    <section id="contact"
        className="w-full bg-white overflow-hidden pb-[35px] lg:pb-[70px] pt-[35px] px-3 xs:px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="w-full max-w-7xl mx-auto overflow-hidden min-w-0 md:w-[668px] lg:w-full">
            <div className="flex flex-col lg:flex-row gap-6 xs:gap-7 sm:gap-8 lg:gap-[2%] xl:gap-8 items-stretch">
                {/* <!-- Left - Request a Call Back Form (full width, left aligned) --> */}
                <div
                    className="w-full lg:flex-[0_0_67%] xl:flex-[0_0_824px] xl:max-w-[824px] min-w-0 flex flex-col items-start rounded-lg border border-[#FADEC3] p-4 xs:p-5 sm:p-6 md:p-8">
                    <h2
                        className="text-[#000000] text-lg xs:text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold font-montserrat mb-5 xs:mb-6 text-center lg:text-start w-full">
                        Request
                        a Call Back</h2>
                    <form id="callback-form"
                        className="w-full max-w-full bg-white space-y-3.5 xs:space-y-4 sm:space-y-5"
>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-3.5 sm:gap-4">
                            <div>
                                <label htmlFor="callback-name" className="sr-only">Your Name</label>
                                <input type="text" id="callback-name" name="name" placeholder="Your Name *" required
                                    className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                            </div>
                            <div>
                                <label htmlFor="callback-phone" className="sr-only">Phone No.</label>
                                <input type="tel" id="callback-phone" name="phone" placeholder="Phone No. *"
                                    required
                                    className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                            </div>
                            <div>
                                <label htmlFor="callback-email" className="sr-only">Email</label>
                                <input type="email" id="callback-email" name="email" placeholder="Email *" required
                                    className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <label htmlFor="callback-message" className="sr-only">Message</label>
                                <input type="text" id="callback-message" name="message" placeholder="Message *"
                                    required
                                    className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                            </div>
                        </div>
                        <button type="submit"
                            className="btn-overview-solid w-full text-white font-opensans font-semibold text-[14px] xs:text-[15px] sm:text-[16px] px-5 xs:px-6 py-3 xs:py-3.5 sm:py-4 rounded-[5px] transition-all hover:opacity-95 shadow-sm">
                            Get a Call Back
                        </button>
                    </form>
                </div>
                {/* <!-- Right - Promotional text (full width, right aligned) --> */}
                <div
                    className="w-full lg:flex-[0_0_31%] xl:flex-[0_0_402px] xl:max-w-[402px] min-w-0 bg-[#FFF5EB] rounded-[5px] p-5 xs:p-6 sm:p-8 flex flex-col justify-center lg:justify-between lg:pl-6 xl:pl-8 min-h-[200px] xs:min-h-[240px] sm:min-h-[281px] mb-6 lg:mb-0">
                    <div className="text-center lg:text-left">
                        <h3
                            className="text-[#000000] text-[18px] xs:text-[19px] sm:text-[20px] lg:text-[20px] font-opensans mb-2.5 xs:mb-3 text-center lg:text-left">
                            Book Your Site
                            Visit & Explore Luxury</h3>
                        <p
                            className="text-[#000000] text-[20px] xs:text-[22px] sm:text-2xl md:text-[25px] lg:text-[25px] font-semibold font-opensans leading-tight text-center lg:text-left">
                            3 & 4 BHK luxury <br /> residences in Greater Noida!</p>
                    </div>
                    <a href="#"
                        className="btn-overview-solid inline-flex items-center justify-center gap-2 text-white font-montserrat font-semibold text-[12px] xs:text-[13px] sm:text-[14px] px-5 xs:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-[5px] transition-all hover:opacity-95 shadow-sm mt-5 xs:mt-6 sm:w-auto self-center lg:self-start">
                        Connect with us
                        <img src="/eldeco-imgs/images/rotate_arrow.svg" alt=""
                            className="w-[17px] h-[17px] xs:w-[18px] xs:h-[18px] sm:w-[19px] sm:h-[19px] rotate-40 filter invert brightness-0 saturate-0" />
                    </a>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Footer - Disclaimer Section --> */}
    <footer className="w-full bg-[#FFF5EB] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto text-center">
            {/* <!-- Logo & Location --> */}
            <div className="mb-8 sm:mb-10">
                <img src="/eldeco-imgs/images/eld-lg.png" alt="Eldeco 7 Peaks Residences"
                    className="h-16 sm:h-20 md:h-24 w-auto mx-auto mb-3" />

            </div>
            <div className="w-full flex flex-col gap-2">
                {/* <!-- RERA & Bank Details --> */}
                <div
                    className="space-y-2 mb-8 sm:mb-10 text-[#000000] text-[12px] font-[600] sm:text-[13px] font-opensans leading-relaxed">
                    <div
                        className="w-12 h-12 sm:w-[69px] sm:h-[69px] flex items-center justify-center mx-auto bg-white p-[6px]">
                        <img src="/eldeco-imgs/images/Qr-code.jpg" alt="QR Code" className="w-full h-full " />
                    </div>
                    <p>UP RERA REG NO.: UPRERAPRJ106523/01/2026, WEBSITE: WWW.UP-RERA.IN, LAUNCH DATE: 28TH JANUARY,
                        2026</p>
                    <p>ELDECO HOMES DEVELOPERS LTD-COLL A/C, FOR ELDECO 7 PEAKS RESIDENCES-ESC</p>
                    <p>HDFC BANK, BANK ACCOUNT NO.: 57500001893798, IFSC CODE: HDFC0002830</p>
                </div>
            </div>
            {/* <!-- Disclaimer --> */}
            <div
                className="space-y-4 mb-8 sm:mb-10 text-[#000000] text-[13px] sm:text-[16px] font-opensans leading-relaxed text-center mx-auto font-[400]">
                <p>The content, visuals, specifications, and other information provided here are purely illustrative
                    and artistic representations for informational and promotional purposes. They might not be to
                    scale and could change without warning. Nothing in this document is a formal invitation, offer,
                    or contract of any kind.</p>
                <p>The promoter of the project clarifies that the information provided herein are indicative in
                    nature. Plans, specifications, features, and other project details may be changed, amended, or
                    revised by the promoter in compliance with applicable laws and with the consent of appropriate
                    authorities.</p>
            </div>
            {/* <!-- Disclaimer & Privacy Policy Link --> */}
            <a href="#"
                className="inline-block text-[#000000] text-[13px] sm:text-[16px] font-opensans font-[600] hover:underline mb-6">Disclaimer
                & Privacy Policy</a>
            {/* <!-- Copyright --> */}
            <p className="text-[#000000] text-[11px] sm:text-[16px] font-opensans font-[400]">© Copyright 2026 Eldeco.
                All Right
                Reserved.</p>
        </div>
    </footer>

</main>

{/* <!-- Contact Modal Popup --> */}
<div id="contactModal"
    className="fixed inset-0 z-50 hidden flex items-center justify-center bg-black bg-opacity-50 px-3 xs:px-4 sm:px-6">
    <div className="relative w-full max-w-lg bg-white rounded-[10px] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* <!-- Close Button --> */}
        <button type="button" id="close-contact-modal-btn" className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12">
                </path>
            </svg>
        </button>

        {/* <!-- Modal Content --> */}
        <div className="p-5 xs:p-6 sm:p-8">
            <h2
                className="text-[#000000] text-xl xs:text-2xl sm:text-2xl font-bold font-montserrat mb-5 xs:mb-6 text-center">
                Request a Call Back
            </h2>
            <form id="modal-contact-form" className="w-full space-y-4 xs:space-y-5">
                <div>
                    <label htmlFor="modal-name" className="sr-only">Your Name</label>
                    <input type="text" id="modal-name" name="name" placeholder="Your Name *" required
                        className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                </div>
                <div>
                    <label htmlFor="modal-email" className="sr-only">Email</label>
                    <input type="email" id="modal-email" name="email" placeholder="Email *" required
                        className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                </div>
                <div>
                    <label htmlFor="modal-phone" className="sr-only">Phone No.</label>
                    <input type="tel" id="modal-phone" name="phone" placeholder="Phone No. *" required
                        className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30"/>
                </div>
                <div>
                    <label htmlFor="modal-message" className="sr-only">Message</label>
                    <textarea id="modal-message" name="message" placeholder="Message *" required rows="4"
                        className="w-full bg-[#F5F5F5] text-[#000000] placeholder:text-gray-600 rounded-[10px] px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 text-[13px] xs:text-[14px] sm:text-[15px] font-opensans border-none outline-none focus:ring-2 focus:ring-[#A27140]/30 resize-none"></textarea>
                </div>
                <button type="submit" id="modal-submit-btn"
                    className="btn-overview-solid w-full text-white font-opensans font-semibold text-[14px] xs:text-[15px] sm:text-[16px] px-5 xs:px-6 py-3 xs:py-3.5 sm:py-4 rounded-[5px] transition-all hover:opacity-95 shadow-sm">
                    <span id="modal-submit-text">Get a Call Back</span>
                    <span id="modal-submit-loading" className="hidden">Submitting...</span>
                </button>
            </form>
        </div>
    </div>
</div>
</main>
     
    )
}

export default Page;