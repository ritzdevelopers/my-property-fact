"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";

const apiWithAuth = () => ({
  withCredentials: true,
  headers: {
    ...(typeof window !== "undefined" && Cookies.get("token")
      ? { Authorization: `Bearer ${Cookies.get("token")}` }
      : {}),
  },
});

export default function PendingAdminApprovalsClient() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}users/pending-admin-approvals`,
        apiWithAuth(),
      );
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Could not load pending requests.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${id}/approve-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Admin access approved.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed.");
    }
  };

  const reject = async (id) => {
    if (
      !window.confirm(
        "Reject this request? The Admin role and dashboard username will be removed.",
      )
    ) {
      return;
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${id}/reject-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Request rejected.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed.");
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <Spinner animation="border" role="status" variant="success" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <DashboardHeader heading="Pending admin access" />
      <p className="text-muted mb-4">
        These accounts requested the Admin role from the public registration page.
        Approve to grant dashboard access, or reject to remove the Admin role.
      </p>
      {list.length === 0 ? (
        <p className="text-muted">No pending requests.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Dashboard username</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.dashboardUsername || "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      className="me-2"
                      onClick={() => approve(u.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => reject(u.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
