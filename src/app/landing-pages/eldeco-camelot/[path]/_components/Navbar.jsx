'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import ContactModal from './ContactModal'

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const params = useParams()
  const pathParam = params?.path || '1'

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const targetSection = document.querySelector(targetId)
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowMobileMenu(false)
    }
  }

  const onEnquireClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/" title="Logo">
            <Image src="/landing-pages/eldeco-camelot/img/nlg.png" className='img-fluid' alt="Logo" width={150} height={30} unoptimized />
          </Link>

          <button
            className="navbar-toggler d-lg-none border-0"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className="navbar-collapse d-none d-lg-flex">
            <ul className="navbar-nav gap-4 fw-semibold">
              <li>
                <a className="nav-link" href="#hero-section" onClick={(e) => handleNavClick(e, '#hero-section')}>
                  Home
                </a>
              </li>
              <li>
                <a className="nav-link" href="#about-section" onClick={(e) => handleNavClick(e, '#about-section')}>
                  About
                </a>
              </li>
              <li>
                <a className="nav-link" href="#pricing-section" onClick={(e) => handleNavClick(e, '#pricing-section')}>
                  Price
                </a>
              </li>
              {/* <li>
                <a className="nav-link" href="#amenities-section" onClick={(e) => handleNavClick(e, '#amenities-section')}>
                  Amenities
                </a>
              </li> */}
              <li>
                <a className="nav-link" href="#gallery-section" onClick={(e) => handleNavClick(e, '#gallery-section')}>
                  Gallery
                </a>
              </li>
              <li>
                <a className="nav-link" href="#location-section" onClick={(e) => handleNavClick(e, '#location-section')}>
                  Location
                </a>
              </li>
            </ul>
          </div>

          <a
            href="#"
            className="custom-call-btn d-none d-lg-flex"
            onClick={(e) => {
              e.preventDefault();
              onEnquireClick();
            }}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            Enquire Now
          </a>
        </div>
      </nav>

      {/* Mobile Menu Offcanvas */}
      <div className={`offcanvas offcanvas-end ${showMobileMenu ? 'show' : ''}`} id="mobileMenu" style={{ visibility: showMobileMenu ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5>Menu</h5>
          <button className="btn-close" onClick={() => setShowMobileMenu(false)}></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav fw-semibold">
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#hero-section'); setShowMobileMenu(false); }}>
                Home
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#about-section'); setShowMobileMenu(false); }}>
                About
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#pricing-section'); setShowMobileMenu(false); }}>
                Price
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#amenities-section'); setShowMobileMenu(false); }}>
                Amenities
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#gallery-section'); setShowMobileMenu(false); }}>
                Gallery
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={(e) => { handleNavClick(e, '#location-section'); setShowMobileMenu(false); }}>
                Location
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        pathParam={pathParam} 
      />
    </>
  )
}
