"use client";

import Image from "next/image";
import Link from "next/link";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import CommonBreadCrum from "../components/common/breadcrum";

export default function WebStories({ webStoryList }) {
    const titleClampStyle = {
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        minHeight: "2.35rem",
        fontSize: "clamp(0.8125rem, 2.5vw, 0.9375rem)",
        lineHeight: 1.35,
        fontWeight: 600,
    };

    const descriptionClampStyle = {
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        minHeight: "4.5rem",
    };

    const imageWrapperStyle = {
        position: "relative",
        width: "100%",
        aspectRatio: "3 / 4",
        overflow: "hidden",
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        backgroundColor: "#f5f5f5",
    };

    return (
        <>
            <CommonHeaderBanner
                image={"project-banner.jpg"}
                headerText={"Web Stories"}
            />
            <CommonBreadCrum
                pageName={"web-stories"}
            />
            <div className="container py-4">
                <div className="row">
                    {webStoryList
                        .filter((item) => item.webStories.length > 0)
                        .map((item, index) => (
                            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex">
                                <Link
                                    className="card h-100 w-100 text-decoration-none text-dark shadow-sm"
                                    href={`${process.env.NEXT_PUBLIC_API_URL}web-story/${item.categoryName}`}
                                    title={`${item.categoryName} web story`}
                                >
                                    <div style={imageWrapperStyle}>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}web-story/${item.storyCategoryImage}`}
                                            alt={`${item.categoryName} web story`}
                                            fill
                                            sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                                            className="card-img-top"
                                            title={`${item.categoryName} web story`}
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <h2 className="card-title text-capitalize" style={titleClampStyle}>
                                            {item.categoryName}
                                        </h2>
                                        <p className="card-text mb-0" style={descriptionClampStyle}>
                                            {item.categoryDescription}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                </div>
            </div>
        </>
    )
}