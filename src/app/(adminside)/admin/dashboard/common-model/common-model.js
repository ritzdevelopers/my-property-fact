"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export default function CommonModal({ confirmBox, setConfirmBox, api, fetchAllHeadersList }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteData = async () => {
    // Prevent multiple clicks
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(api, { withCredentials: true });
      
      // Handle successful response (204 No Content or 200 OK with message)
      if (response.status === 204 || response.status === 200) {
        // Check if response has a message in data
        if (response.data && response.data.message) {
          toast.success(response.data.message);
        } else {
          toast.success("Data deleted successfully!");
        }
        
        // Close modal and refresh
        setConfirmBox(false);
        
        // Call optional callback if provided
        if (fetchAllHeadersList && typeof fetchAllHeadersList === 'function') {
          fetchAllHeadersList();
        }
        
        router.refresh();
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      // Handle error response from backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check if it's a validation error with multiple fields
        if (errorData.errors && typeof errorData.errors === 'object') {
          // Multiple validation errors
          const errorMessages = Object.values(errorData.errors).join(', ');
          toast.error(errorMessages);
        } else if (errorData.message) {
          // Single error message
          toast.error(errorData.message);
        } else if (errorData.error) {
          // Error object with 'error' field
          toast.error(errorData.error);
        } else {
          // Fallback to status text or generic message
          toast.error(error.response.statusText || "Failed to delete data");
        }
      } else if (error.message) {
        // Network or other axios errors
        if (error.message.includes('Network Error')) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred while deleting data");
      }
      
      console.error("Delete Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal 
        show={confirmBox} 
        onHide={() => {
          if (!isDeleting) {
            setConfirmBox(false);
          }
        }} 
        centered
        backdrop={isDeleting ? 'static' : true}
      >
        <Modal.Header closeButton={!isDeleting}>
          <Modal.Title>Are you sure you want to delete?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDeleting && (
            <div className="text-center mb-3">
              <Spinner animation="border" variant="danger" size="sm" className="me-2" />
              <span>Deleting...</span>
            </div>
          )}
          <p className="text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button 
            variant="secondary" 
            onClick={() => setConfirmBox(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={deleteData}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
