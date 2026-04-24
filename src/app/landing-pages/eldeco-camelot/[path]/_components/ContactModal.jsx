'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import ContactForm from './ContactForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function ContactModal({ isOpen, onClose, pathParam = '1' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      tabIndex={-1}
      aria-labelledby="contactModalLabel"
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content contact-modal-content">
          <div className="row g-0">
            <div className="col-lg-5 d-none d-lg-block">
              <div className="modal-image-section">
                <Image src="/landing-pages/eldeco-camelot/img/eldeco-g-3.webp" alt="Eldeco Camelot — project visual, My Property Fact" title="Eldeco Camelot — project visual, My Property Fact" className="modal-side-image" width={500} height={500} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            </div>
            <div className="col-lg-7 col-12">
              <div className="modal-form-section">
                <div className="modal-header-section">
                  <h5 className="modal-title-text">Get In Touch</h5>
                  <p className="modal-subtitle-text">Fill in your details and we&apos;ll get back to you</p>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    {/* <i className="fa-solid fa-xmark"></i> */}
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <ContactForm formType="modal" pathParam={pathParam} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
