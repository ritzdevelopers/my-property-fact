'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function Home() {
  const [activeTab, setActiveTab] = useState('menu'); // Initialize with the default active tab
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  const formRef1 = useRef(null);
  const formRef2 = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const scriptURL =
    'https://script.google.com/macros/s/AKfycbzixiVyziEnKNKnS72yHhzwzOoDLuMjyFf2xqOPh0hHaru2kld7-LV1pUtZpAYKXR0/exec';

  const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e, formRef) => {
    e.preventDefault();

    const form = formRef.current;
    const mobileNo = form.qMobileNo.value.trim();
    const email = form.qEmailID.value.trim();
    if (!isValidMobile(mobileNo)) {
      alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(form);
      const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      formData.append('Time', currentTime);
      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        form.reset();
        router.push('eldeco-la-vida-bella/thankyou'); // make sure you have this page
      } else {
        console.error('Form submission failed:', await response.text());
        alert('There was an issue submitting the form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Submission error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const closeModal = () => {
      const modal = document.getElementById('myModal');
      if (modal) modal.style.display = 'none';
    };

    const buttons = document.querySelectorAll('.close');
    buttons.forEach(btn => btn.addEventListener('click', closeModal));

    const handleOutsideClick = (event) => {
      const modal = document.getElementById('myModal');
      if (modal && event.target === modal) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);


    return () => {
      buttons.forEach(btn => btn.removeEventListener('click', closeModal));
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      const modal = document.getElementById('myModal');
      modal?.classList.add('show');
      modal?.setAttribute('style', 'display: block');
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      e.preventDefault();
      const target = (e.currentTarget).hash;
      const el = document.querySelector(target);
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 50,
          behavior: 'smooth',
        });
      }
    };

    document.querySelectorAll('.nav-link-custom').forEach(el => {
      el.addEventListener('click', handleClick);
    });

    return () => {
      document.querySelectorAll('.nav-link-custom').forEach(el => {
        el.removeEventListener('click', handleClick);
      });
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const div = document.querySelector('.pricelistdiv12');
      const img = document.querySelector('.iconimgTop');

      if (window.innerWidth > 768 && window.scrollY > 300) {
        if (div) (div).style.display = 'none';
        if (img) img.src = '/eldeco-la-vida-bella-images/images/images/plus.png';
      } else {
        if (div) (div).style.display = 'block';
        if (img) img.src = '/eldeco-la-vida-bella-images/images/images/minus.png';
      }
    };

    const handleClick = () => {
      const div = document.querySelector('.pricelistdiv12');
      const img = document.querySelector('.iconimgTop');

      if (div) {
        div.style.display = div.style.display === 'none' ? 'block' : 'none';
      }

      if (img) {
        img.src = img.src.includes('plus.png') ? '/eldeco-la-vida-bella-images/images/minus.png' : '/eldeco-la-vida-bella-images/images/plus.png';
      }
    };

    window.addEventListener('scroll', handleScroll);

    const topForm = document.querySelector('.top_form');
    if (topForm) {
      topForm.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (topForm) {
        topForm.removeEventListener('click', handleClick);
      }
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    // Optional:  Close the menu when a link is clicked (if you want that behavior)
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };
    // You might need to use next/router if you're handling route changes manually
    // import { useRouter } from 'next/router';
    // const router = useRouter();
    // router.events.on('routeChangeComplete', handleRouteChange);
    // Or, if you're using simple anchor links, you can listen for click events on the links
    const navLinks = document.querySelectorAll('.navbar-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', handleRouteChange);
    });
    return () => {
      // Clean up event listeners
      // if (router && router.events) {
      //   router.events.off('routeChangeComplete', handleRouteChange);
      // }
      navLinks.forEach(link => {
        link.removeEventListener('click', handleRouteChange);
      });
    };
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('header_menu');
      if (!header) return;

      if (window.scrollY > 100) {
        header.classList.add('newClass');
      } else {
        header.classList.remove('newClass');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const versionUpdate = new Date().getTime();
    const script = document.createElement('script');
    script.src = `https://api2.gtftech.com/scripts/queryform.min.ssl.js?v=${versionUpdate}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const removeItems = (className) => {
      document.querySelectorAll(`.${className}`).forEach(el => el.remove());
    };

    if (isMobile) {
      removeItems('d_sm_none');
    } else {
      removeItems('d_sm_block');
    }
  }, []);

  const loaderRef = useRef(null);

  useEffect(() => {
    const showLoader = () => {
      if (loaderRef.current) loaderRef.current.style.display = 'block';
    };

    const form1 = document.getElementById('form1');
    const form2 = document.getElementById('form2');

    const onSubmit1 = () => showLoader();
    const onSubmit2 = () => showLoader();

    form1?.addEventListener('submit', onSubmit1);
    form2?.addEventListener('submit', onSubmit2);

    return () => {
      form1?.removeEventListener('submit', onSubmit1);
      form2?.removeEventListener('submit', onSubmit2);
    };
  }, []);


  return (
    <>
      {/* <!-------------------------- Navbar Start From Here  ------------------------------> */}

      <div className="container-fluid navbar_container" id="header_menu">
        <nav className="navbar navbar-expand-md navbar-light bg-white"> {/* Adjust classes as needed */}
          <div className="container"> {/* Optional: Add a container for better layout */}
            <Link className="navbar-brand" href="#"> {/* Replace with your logo or brand name */}
              {/* Your Logo Here */}
              <img src="/eldeco-la-vida-bella-images/images/developer-logo.webp" alt="Logo" />
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleMenu} // Use onClick instead of data-toggle/data-target
              aria-controls="collapsibleNavbar"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <img src="/eldeco-la-vida-bella-images/images/menu-bar.png" alt="Menu" className="img-fluid menu_bar" width={30} height={30} />
            </button>

            <div
              className={`collapse navbar-collapse justify-content-end ${isMenuOpen ? 'show' : ''}`} // Conditionally add 'show' class
              id="collapsibleNavbar"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" href="#">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" href="#overview">Overview</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" href="#highlights">Highlights</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" href="#price-list">Price List</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" href="#amenities">Amenities</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" href="#floors-plan">Floors plan</Link>
                </li>
                <li className="nav-item specail-li">
                  <Link className="nav-link nav-link-custom" href="#location">Location</Link>
                </li>
                <li className="nav-item specail-li">
                  <Link className="nav-link nav-link-custom" href="#gallery">Gallery</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
      {/* <!-------------------------- Navbar End From Here ------------------------------> */}
      {/* <!-------------------------- Slider Start From Here  ------------------------------> */}

      <div className="container-fluid slider_container p-0" id="home">
        <div id="demo" className="carousel slide" data-ride="carousel">
          {/* <!-- The slideshow --> */}
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/eldeco-la-vida-bella-images/images/banner_img.jpg"
                alt="Eldeco-la-vida-bella "
                className="w-100"
              />
            </div>
            {/* <!-- <div className="carousel-item">
            <img
              src="/eldeco-la-vida-bella-images/images/banner-2.jpg"
              alt="Eldeco-la-vida-bella "
              className="w-100"
            />
          </div> --> */}
          </div>

          {/* <!-- Left and right controls --> */}
          {/* <!-- <div className="btn-group">
                <Link className="carousel-control-prev" href="#demo" data-slide="prev">
                    <img src="/eldeco-la-vida-bella-images/images/leftarrow.png" alt="left arrow" className="img-fluid arrow-icon">
                </Link>
                <Link className="carousel-control-next" href="#demo" data-slide="next">
                    <img src="/eldeco-la-vida-bella-images/images/rightarrow.png" alt="left arrow" className="img-fluid arrow-icon">
                </Link>
            </div> --> */}
        </div>

        {/* <!-- <div className="main_inside_container">
            <div className="main_row">
                <div className="custom_col_right">
                    <div className="details_withForm">
                        <div className="box-1">
                            <p className="location-p">Sector 12, Greater Noida (west)</p>
                            <h1 className="projectName_heading">
                                <img src="/eldeco-la-vida-bella-images/images/project-logo.png" alt="developer-logo" className="img-fluid project-logo" />
                            </h1>
                            <h4 className="typology_heading">3/4 BR Premium Residences</h4>
                            <p className="price_heading">STARTING AT</p>
                            <h4 className="starting-price">₹ 3.30 Cr* Onwards</h4>
                            <h4 className="typology_heading">Status : New Launch</h4>
                            <p className="status blink-hard" data-toggle="modal" data-target="#myModal"
                                style="cursor:pointer;">Download Brochure </p>
                        </div>
                    </div>
                </div>
            </div>
        </div> --> */}
      </div>

      {/* <!-------------------------- Slider End From Here  ------------------------------> */}

      <div className="form-box">
        <div className="top_form">
          <h2>
            Contact With Us!
            <span>
              <img
                src="/eldeco-la-vida-bella-images/images/minus.png"
                alt="minus-icon"
                className="img-fluid mybtn iconimgTop"
                id="showfrm"
              />
            </span>
          </h2>
        </div>
        <div className="pricelistdiv12" style={{ display: "block" }}>
          <div className="from-banner">
            <div className="form_content">
              <div className="pricelistdiv12" style={{ display: 'block' }}>
                <div className="form_inner">
                  <form
                    id="form1"
                    name="submit-to-google-sheet-form-1"
                    ref={formRef1}
                    onSubmit={(e) => handleSubmit(e, formRef1)}
                  >
                    <input
                      type="text"
                      name="Name"
                      className="form-control"
                      placeholder="Name"
                      id="qSenderName"
                      required
                    />
                    <input
                      type="tel"
                      name="Mobile"
                      className="form-control number-only"
                      placeholder="Mobile No"
                      id="qMobileNo"
                      minLength="10"
                      required
                    />
                    <input
                      type="email"
                      name="Email"
                      className="form-control email-address"
                      placeholder="E-Mail Address"
                      id="qEmailID"
                      required
                    />
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Comments.."
                      name="Message"
                      id="qMessage"
                      required
                    />
                    <input type="hidden" name="Project" value="Eldeco-La-Vida-Bella-taboola" />
                    <button
                      type="submit"
                      className="btn btn-warning enquire-btn"
                      id="SubmitQuery"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Schedule Site Visit'}
                    </button>
                  </form>

                  {loading && (
                    <div id="loader1" className="loader mt-2 text-center text-sm text-gray-500">
                      Submitting...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-------------- Overview Section Codes Starts From Here -----------------> */}
      <div className="container-fluid overview_container p-0" id="overview">
        {/* <!-- <img src="/eldeco-la-vida-bella-images/images/logo/rotate-logo.png" alt="" className="img-fluid overview_bg_logo">  --> */}
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6">
            <div className="forbox_imgs">
              <div className="row">
                <div className="col-6 col-sm-12 col-md-6 col-lg-6 first_col">
                  <img
                    src="/eldeco-la-vida-bella-images/images/o1.png"
                    alt="Eldeco-la-vida-bella "
                    className="img-fluid img-1"
                  />
                </div>
                <div className="col-6 col-sm-12 col-md-6 col-lg-6 second_col">
                  <img
                    src="/eldeco-la-vida-bella-images/images/o2.png"
                    alt="Eldeco-la-vida-bella "
                    className="img-fluid img-1"
                  />
                </div>
                <div className="col-6 col-sm-12 col-md-6 col-lg-6 third_col">
                  <img
                    src="/eldeco-la-vida-bella-images/images/o3.png"
                    alt="Eldeco-la-vida-bella "
                    className="img-fluid img-1"
                  />
                </div>
                <div className="col-6 col-sm-12 col-md-6 col-lg-6 forth_col">
                  <img
                    src="/eldeco-la-vida-bella-images/images/o4.png"
                    alt="Eldeco-la-vida-bella "
                    className="img-fluid img-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 col_right">
            <div className="content-box">
              <h6 className="custom_heading">ABOUT US</h6>
              <h1>Discover Luxury At It&apos;s Best.</h1>
              <p>
                Eldeco La Vida Bella takes you to the center of excitement and
                comfort. Situated amidst beautiful scenery in the thriving area of
                Greater Noida West, it consists of 5 luxurious towers, each
                apartment is equipped with all-weather air conditioning and
                invites you to experience the epitome of modern lifestyle. Expect
                3 and 4 BHK premium luxury residences accessible via the 130 meter
                Noida-Greater Noida link road. Enjoy the convenience of a 24 meter
                wide internal road for smooth travel throughout the property.
                Treat yourself to an exquisite 9 foot tall front door with digital
                lock that will add a touch of security and elegance to your life.
              </p>
              <span className="border-span"></span>
              <button
                type="button"
                className="btn btn-download-brochure"
                data-toggle="modal"
                data-target="#myModal"
                onClick={() => {
                  const modal = document.getElementById('myModal');
                  if (modal) modal.style.display = 'block';
                }}
              >
                Download Brochure <i className="fa fa-long-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <!-------------- Overview Section Codes End From Here ----------------->
    <!-------------- Highlights Section Codes Starts From Here -----------------> */}
      <div className="container-fluid highlights_container" id="highlights">
        <div className="row">
          <div className="col-sm-12">
            <div className="all_custom_heading">
              <h6 className="custom_heading">PROJECT</h6>
              <h1>Highlights</h1>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">1</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h1.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para">
                    <span>All Weather Air Conditioning In All Rooms</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">2</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h2.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para">
                    <span>9-Ft Entrance Door With Digital Lock</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">3</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h3.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para">
                    <span>Floor To Floor 11 Ft Height</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">4</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h4.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para">
                    <span>Double height air-conditioned lobby </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">5</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h5.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para">
                    <span>Rooftop swimming pool with loungers</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="box">
                <div className="highlight_box">
                  <span className="span-count">6</span>
                  <img
                    src="/eldeco-la-vida-bella-images/images/h3.png"
                    alt=""
                    className="img-fluid highlights-icons"
                  />
                  <div className="p-para"><span>High street retail 9 kms</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-------------- Highlights Section Codes End From Here ----------------->
    <!-------------- Price List Section Codes Starts From Here -----------------> */}
      <div className="container-fluid pricelist_container" id="price-list">
        <div className="row">
          <div className="col-sm-12">
            <div className="all_custom_heading">
              <h6 className="custom_heading">PROJECT</h6>
              <h1>Price List</h1>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="pricelist_box">
                <h1 className="typology">3 BR Residences</h1>
                {/* <!-- <h3 className="size">On Request </h3> --> */}
                <h5 className="pricelist_p" style={{ fontSize: "45px" }}>(Sold out...)</h5>
                {/* <!-- <h5 className="pricelist_p">On Request</h5> --> */}
                <button
                  type="button"
                  className="btn btn-custom"
                  data-toggle="modal"
                  data-target="#myModal"
                  onClick={() => {
                    const modal = document.getElementById('myModal');
                    if (modal) modal.style.display = 'block';
                  }}
                >
                  Enquire Now
                </button>
                <span>01</span>
                <span className="span-2">Residences</span>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-4">
              <div className="pricelist_box">
                <h1 className="typology">4 BR Residences</h1>
                {/* <!-- <h3 className="size">On Request </h3> --> */}
                <h5 className="pricelist_p">₹ 3.58 Cr* Onwards</h5>
                <button
                  type="button"
                  className="btn btn-custom"
                  data-toggle="modal"
                  data-target="#myModal"
                  onClick={() => {
                    const modal = document.getElementById('myModal');
                    if (modal) modal.style.display = 'block';
                  }}
                >
                  Enquire Now
                </button>
                <span>02</span>
                <span className="span-2">Residences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-------------- Price List Section Codes End From Here -----------------> */}
      {/* <!-------------- Amenities Section Codes Starts From Here -----------------> */}
      <div className="container-fluid amenities_container" id="amenities">
        <div className="row">
          <div className="col-sm-12">
            <div className="all_custom_heading">
              <h6 className="custom_heading">PROJECT</h6>
              <h1>Amenities</h1>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>01</span>
                  <img src="/eldeco-la-vida-bella-images/images/a1.png" alt="amenities" className="img-fluid" />
                  <h4>Lifestyle club</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>02</span>
                  <img src="/eldeco-la-vida-bella-images/images/a2.png" alt="amenities" className="img-fluid" />
                  <h4>Roof Top Swimming Pool With Loungers</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>03</span>
                  <img src="/eldeco-la-vida-bella-images/images/a3.png" alt="amenities" className="img-fluid" />
                  <h4>Gym</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>04</span>
                  <img src="/eldeco-la-vida-bella-images/images/a4.png" alt="amenities" className="img-fluid" />
                  <h4>Yoga and Meditation</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>05</span>
                  <img src="/eldeco-la-vida-bella-images/images/a5.png" alt="amenities" className="img-fluid" />
                  <h4>Amphitheatre</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>06</span>
                  <img src="/eldeco-la-vida-bella-images/images/a6.png" alt="amenities" className="img-fluid" />
                  <h4>Multi-Purpose Court</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>07</span>
                  <img src="/eldeco-la-vida-bella-images/images/a7.png" alt="amenities" className="img-fluid" />
                  <h4>Table Tennis</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3">
              <div className="amenities_box">
                <div className="box">
                  <span>08</span>
                  <img src="/eldeco-la-vida-bella-images/images/a9.png" alt="amenities" className="img-fluid" />
                  <h4>Kids Play Area</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-------------- Amenities Section Codes End From Here ----------------->
    <!-------------- Floor Plans Section codes Starts From Here -----------------> */}

      <div className="container-fluid floorsplan_container" id="floors-plan">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="all_custom_heading">
                <h6 className="custom_heading">PROJECT</h6>
                <h1>Floors Plan</h1>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8 position-relative">
              <div className="tab-content">
                <div className={`tab-pane fade ${activeTab === 'menu' ? 'show active' : ''}`} id="menu">
                  <a href="/eldeco-la-vida-bella-images/images/m-plan.png" className="with-caption image-link" title="floor plan">
                    <img
                      src="/eldeco-la-vida-bella-images/images/m-plan.png"
                      alt="floor plan"
                      className="img-fluid"
                      width={800} // Adjust width as needed
                      height={600} // Adjust height as needed
                      layout="responsive" // Optional: Make the image responsive
                    />
                  </a>
                  <button
                    className="btn btn-custom position-absolute top-50 start-50 translate-middle"
                    style={{ background: '#022e21', color: '#fff' }}
                    data-bs-toggle="modal"
                    data-bs-target="#myModal"
                  >
                    View Plan
                  </button>
                </div>
                <div className={`tab-pane fade ${activeTab === 'menu1' ? 'show active' : ''}`} id="menu1">
                  <img
                    src="/eldeco-la-vida-bella-images/images/floorplan-min-1.webp"
                    alt="floor plan"
                    style={{ filter: 'blur(5px)' }}
                    className="img-fluid"
                    width={800} // Adjust width as needed
                    height={600} // Adjust height as needed
                    layout="responsive" // Optional: Make the image responsive
                  />
                  <button
                    className="btn btn-custom position-absolute top-50 start-50 translate-middle"
                    style={{ background: '#022e21', color: '#fff' }}
                    data-bs-toggle="modal"
                    data-bs-target="#myModal"
                  >
                    View Plan
                  </button>
                </div>
                <div className={`tab-pane fade ${activeTab === 'menu2' ? 'show active' : ''}`} id="menu2">
                  <img
                    src="/eldeco-la-vida-bella-images/images/floorplan-min-1.webp"
                    alt="floor plan"
                    style={{ filter: 'blur(5px)' }}
                    className="img-fluid"
                    width={800} // Adjust width as needed
                    height={600} // Adjust height as needed
                    layout="responsive" // Optional: Make the image responsive
                  />
                  <button
                    className="btn btn-custom position-absolute top-50 start-50 translate-middle"
                    style={{ background: '#022e21', color: '#fff' }}
                    data-bs-toggle="modal"
                    data-bs-target="#myModal"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`}
                    onClick={() => handleTabClick('menu')}
                    href="#menu"
                    role="tab" // Add role="tab" for accessibility
                    data-bs-toggle="tab" // Keep data-bs-toggle for Bootstrap's styling
                  >
                    Master Plan
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'menu1' ? 'active' : ''}`}
                    onClick={() => handleTabClick('menu1')}
                    href="#menu1"
                    role="tab" // Add role="tab" for accessibility
                    data-bs-toggle="tab" // Keep data-bs-toggle for Bootstrap's styling
                  >
                    3 BR Apartments (SOLD)
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'menu2' ? 'active' : ''}`}
                    onClick={() => handleTabClick('menu2')}
                    href="#menu2"
                    role="tab" // Add role="tab" for accessibility
                    data-bs-toggle="tab" // Keep data-bs-toggle for Bootstrap's styling
                  >
                    4 BR Apartments
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* <!-------------- Floor Plans Section Codes End From Here ----------------->
    <!-------------- Location Map Section Codes Starts From Here -----------------> */}
      <div className="container-fluid location_container" id="location">
        <div className="row">
          <div className="col-sm-12">
            <div className="all_custom_heading">
              <h6 className="custom_heading">PROJECT</h6>
              <h1>Location Advantage</h1>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2174.1554362724883!2d77.4826219!3d28.5637517!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cedb149f73373%3A0xb26e50f12bb2c846!2sEldeco%20La%20Vida%20Bella!5e1!3m2!1sen!2sin!4v1714226439012!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: "0" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6">
            <div className="timelines">
              <div className="timeline education">
                <div className="timeline-items">
                  <div className="timeline-item">
                    <h3>The proposed Metro Station is 3 Km away</h3>
                    <h3>High Street shops 6.5 Kms</h3>
                    <h3>Multi Speciality Hospital- 4 Km</h3>
                    <h3>Hotels- 9 Km</h3>
                    <h3>FNG Corridor- 11 Km</h3>
                    <h3>Petrol Pump- 170 Mtr</h3>
                    <h3>Knowledge Park V- 3 Km</h3>
                    <h3>Noida Special Economic Zone- 14 Km</h3>
                    <h3>Noida Golf Course- 19 Km</h3>
                    <h3>
                      Accessible via Greater Noida Link Road, which is 130 meters
                      long
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-------------- Location Map Section Code End From Here ----------------->
    <!-------------- Gallery Section Code Starts From Here -----------------> */}
      <div className="container-fluid gallery_container" id="gallery">
        <div className="row">
          <div className="col-sm-12">
            <div className="all_custom_heading">
              <h6 className="custom_heading">PROJECT</h6>
              <h1>Gallery</h1>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g1-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g1-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g2-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g2-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g3-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g3-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g4-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g4-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g5-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g5-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g6-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g6-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g7-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g7-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
            <div className="col-6 col-sm-12 col-md-3 col-lg-3">
              <Link
                href="/eldeco-la-vida-bella-images/images/g8-sm.png"
                className="with-caption image-link"
                title="Eldeco-la-vida-bella"
              >
                <img
                  src="/eldeco-la-vida-bella-images/images/g8-sm.png"
                  alt="Eldeco-la-vida-bella "
                  className="img-fluid gallery_img"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <!-------------- Gallery Section Codes End From Here ----------------->
    <!-------------- Footer Section Codes Starts From Here -----------------> */}
      <div className="container-fluid container_footerform" id="contact_us">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-12">
              <div className="all_custom_heading">
                <h6 className="custom_heading">PROJECT DEVELOPER</h6>
                <h1>About Eldeco Group</h1>
              </div>
              <p>
                In addition to our luxurious residences, Eldeco-Trinity offers a
                host of exclusive amenities designed to elevate your living
                experience. From state-of-the-art fitness centers and lush green
                spaces to serene meditation areas and vibrant community hubs,
                every aspect of our project is crafted with your well-being in
                mind. Our dedicated team is committed to providing unparalleled
                customer service, ensuring that your journey with Eldeco-Trinity
                is seamless from start to finish. Explore the endless
                possibilities of luxury living and make Eldeco-Trinity your
                ultimate destination for refined elegance and unmatched comfort.
                Welcome home to a world where every detail is designed to exceed
                your expectations.At Eldeco-Trinity, we believe in creating not
                just homes, but lifestyles that inspire. With a focus on
                sustainability and innovation, we strive to build communities
                where residents thrive. Trust in our legacy of excellence and let
                Eldeco-Trinity be the beginning of your extraordinary journey in
                luxury living.
              </p>
              <hr />
              <div className="d-p">
                <p>© Copyright 2024 Eldeco-la-vida-bella . All Right Reserved.</p>
                <p style={{ paddingTop: "8px" }}>
                  Project RERA No.: UPRERAPRJ136219/04/2024
                </p>
                <p>
                  <Link href="disclaimer.html" target="_blank"
                  >Disclaimer &amp; Privacy Policy</Link
                  >
                </p>
                {/* <!-- <Link href="/eldeco-la-vida-bella-images/images/qrcode.jpeg" className="with-caption image-link" title="Eldeco-la-vida-bella"> -->
              <!-- <img src="/eldeco-la-vida-bella-images/images/qrcode.jpeg" alt="Eldeco-la-vida-bella " className="img-fluid gallery_img"> --> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-------------- Footer Section Codes End From Here -----------------> */}
      <div className="mobile-section_1">
        <div className="mobile-section">
          <Link
            href=""
            className="btn btn-success"
            title="Enquire Now"
            data-toggle="modal"
            data-target="#myModal"
            onClick={() => {
              const modal = document.getElementById('myModal');
              if (modal) modal.style.display = 'block';
            }}
          >
            Enquire Now</Link
          >
        </div>
      </div>

      {/* <!-- The Modal --> */}
      <div className="modal" id="myModal" aria-hidden="true" style={{ display: "none" }}>
        <div className="modal-dialog" style={{ height: "100vh" }}>
          <div className="modal-content">
            <button type="button" className="close" data-dismiss="modal">
              <img
                src="/eldeco-la-vida-bella-images/images/modal-close.png"
                alt="close-icon"
                className="img-fluid modal_close"
              />
            </button>
            {/* <!-- Modal body --> */}
            <div className="modal-body">
              <div className="top_modal_content">
                <img
                  src="/eldeco-la-vida-bella-images/images/project-logo.png"
                  alt="project-logo"
                  className="img-fluid modal-logo"
                />
                <p className="location-p">Sector 12, Greater Noida (west)</p>
                <h4 className="typology_heading">4 BR Premium Residences</h4>
              </div>
              <div className="form_inner max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
                <form
                  id="form1"
                  name="submit-to-google-sheet-form-1"
                  ref={formRef2}
                  onSubmit={(e) => handleSubmit(e, formRef2)}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    name="Name"
                    className="form-control w-full px-4 py-2 border rounded"
                    placeholder="Name"
                    id="qSenderName"
                    required
                  />
                  <input
                    type="tel"
                    name="Mobile"
                    className="form-control w-full px-4 py-2 border rounded"
                    placeholder="Mobile No"
                    id="qMobileNo"
                    minLength="10"
                    required
                  />
                  <input
                    type="email"
                    name="Email"
                    className="form-control w-full px-4 py-2 border rounded"
                    placeholder="E-Mail Address"
                    id="qEmailID"
                    required
                  />
                  <input
                    className="form-control w-full px-4 py-2 border rounded"
                    type="text"
                    placeholder="Comments.."
                    name="Message"
                    id="qMessage"
                    required
                  />
                  <input type="hidden" name="Project" value="Eldeco-La-Vida-Bella-taboola" />

                  <button
                    type="submit"
                    className="btn btn-warning bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full"
                    disabled={loading}
                    style={{ width: "100%" }}
                  >
                    {loading ? 'Submitting...' : 'Schedule Site Visit'}
                  </button>
                </form>

                {loading && (
                  <div
                    id="loader1"
                    className="text-center mt-4 text-sm text-gray-600 animate-pulse"
                  >
                    Submitting your response...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div >

      <div className="modal fade show in" id="strip_modal" role="dialog">
        <div className="modal-dialog modal-lg">
          {/* <!-- Modal content--> */}
          <div className="modal-content">
            <div className="modal-body inq-form">
              <div className="row">
                <div className="col-md-6 left_col">
                  {/* <img
                    src="/eldeco-la-vida-bella-images/images/modal-img.webp"
                    alt="modal img"
                    className="img-fluid"
                  /> */}
                </div>

                <div className="col-md-6 right_col">
                  <button type="button" className="close" data-dismiss="modal">
                    ×
                  </button>
                  <div className="formbox2">
                    <div className="top_modal_content">
                      {/* <!-- <img src="/eldeco-la-vida-bella-images/images/logo/project-logo.png" alt="project-logo"
                                        className="img-fluid modal-logo"> --> */}
                      <p className="location-p">Sector 12, Greater Noida (west)</p>
                      <h4 className="typology_heading">4 BR Premium Residences</h4>
                    </div>
                    <div className="form_inner form_inner_2">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Name"
                        id="qSenderNamemodal3"
                      />
                      <input
                        type="number"
                        name="contact"
                        className="form-control number-only"
                        placeholder="Mobile No"
                        id="qMobileNomodal3"
                      />
                      <input
                        type="email"
                        name="email"
                        className="form-control email-address"
                        placeholder="E-Mail Address"
                        id="qEmailIDmodal3"
                      />
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Comments.."
                        name="message"
                        id="qMessagemodal3"
                      />
                      <button
                        type="button"
                        className="btn btn-warning enquire-btn"
                        id="SubmitQuerymodal3"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
