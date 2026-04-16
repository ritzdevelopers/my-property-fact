"use client";
import "react-toastify/dist/ReactToastify.css";
import "sonner/dist/styles.css";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { ProjectProvider } from "@/app/_global_components/contexts/projectsContext";
import SiteTrafficBeacon from "@/app/_global_components/SiteTrafficBeacon";

export default function Providers({ children }) {
    return (
        <ProjectProvider>
            <Suspense fallback={null}>
                <SiteTrafficBeacon />
            </Suspense>
            {children}
            <ToastContainer />
            <Toaster
                position="top-center"
                richColors
                closeButton
                offset="72px"
                expand={false}
                gap={10}
            />
        </ProjectProvider>
    );
}