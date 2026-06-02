"use client";

import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "./SocialFeedsOfMPF.css";
import {
  FaInstagram,
  FaYoutube,
  FaPlay,
  FaHeart,
  FaRegComment,
  FaShare,
  FaTimes,
} from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

export default function SocialFeedsOfMPF() {
  const [activeTab, setActiveTab] = useState("instagram");

  const [showModal, setShowModal] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);
  // ---------------- INSTAGRAM DATA ----------------
  const instagramPosts = [
    {
      id: 1,
      type: "image",
      media:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
      caption: "Great Place To Work Certified™",
    },
    {
      id: 2,
      type: "video",
      media: "https://www.w3schools.com/html/mov_bbb.mp4",
      caption: "Team celebration moments",
    },
    {
      id: 3,
      type: "image",
      media:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200",
      caption: "Office culture & success",
    },
    {
      id: 4,
      type: "image",
      media:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200",
      caption: "Office culture & success",
    },
    {
      id: 5,
      type: "image",
      media:
        "https://www.instagram.com/my.property.fact/reel/DR1n2a_jxYV/",
      caption: "Office culture & success",
    },
    {
      id: 6,
      type: "image",
      media:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200",
      caption: "Office culture & success",
    },
  ];

  // ---------------- YOUTUBE DATA ----------------
  const youtubeVideos = [
    {
      id: 1,
      thumb: "https://i.ytimg.com/vi/7z2-277kK7w/maxresdefault.jpg",
      video: "https://www.youtube.com/embed/7z2-277kK7w?autoplay=1",
    },
    {
      id: 2,
      thumb: "https://i.ytimg.com/vi/7z2-277kK7w/maxresdefault.jpg",
      video: "https://www.youtube.com/embed/7z2-277kK7w?autoplay=1",
    },
    
    {
      id: 3,
      thumb: "https://i.ytimg.com/vi_webp/vAUTVfKpWW4/maxresdefault.webp",
      video: "https://www.youtube.com/embed/vAUTVfKpWW4?autoplay=1",
    },
    {
      id: 4,
      thumb: "https://i.ytimg.com/vi/7z2-277kK7w/maxresdefault.jpg",
      video: "https://www.youtube.com/embed/7z2-277kK7w?autoplay=1",
    },
    
    {
      id: 5,
      thumb: "https://i.ytimg.com/vi_webp/vAUTVfKpWW4/maxresdefault.webp",
      video: "https://www.youtube.com/embed/vAUTVfKpWW4?autoplay=1",
    },    
  ];

  const currentData =
    activeTab === "instagram" ? instagramPosts : youtubeVideos;

  // OPEN POPUP
  const openPopup = (index) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  // AUTO SCROLL ONLY FOR INSTAGRAM
  useEffect(() => {
    if (showModal && activeTab === "instagram" && scrollRef.current) {
      const child = scrollRef.current.children[selectedIndex];
      child?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showModal, selectedIndex, activeTab]);

  return (
    <div className="container py-5">

      {/* TITLE */}
      <h2 className="text-center fw-bold mb-4">
        Social Media Feed
      </h2>

      {/* TABS */}
      <div className="d-flex justify-content-center gap-3 mb-4">

        <button
          type="button"
          className={`social-feed-tab ${
            activeTab === "instagram" ? "social-feed-tab--active" : ""
          }`}
          onClick={() => setActiveTab("instagram")}
        >
          <FaInstagram className="me-2" />
          Instagram
        </button>

        <button
          type="button"
          className={`social-feed-tab ${
            activeTab === "youtube" ? "social-feed-tab--active" : ""
          }`}
          onClick={() => setActiveTab("youtube")}
        >
          <FaYoutube className="me-2" />
          YouTube
        </button>

      </div>

      {/* SLIDER + NAVIGATION */}
      <div className="position-relative overflow-hidden">

        {/* PREV */}
        <button
          className="social-prev btn  position-absolute translate-middle-y z-3"
          style={{ width: 45, height: 45, borderRadius: "40%" , backgroundColor: "#0D5834", color: "#fff", top: "40%",left: "-15px" }}
        >
          ❮
        </button>

        {/* NEXT */}
        <button
          className="social-next btn position-absolute  translate-middle-y z-3"
          style={{ width: 45, height: 45, borderRadius: "40%", backgroundColor: "#0D5834", color: "#fff", top: "40%" ,right: "-15px" }}
        >
          ❯
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".social-next",
            prevEl: ".social-prev",
          }}
          spaceBetween={20}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 4 },
          }}
        >
          {currentData.map((item, index) => (
            <SwiperSlide key={item.id}>
              <div
                className="position-relative overflow-hidden rounded cursor-pointer"
                onClick={() => openPopup(index)}
              >
                {activeTab === "instagram" ? (
                  item.type === "image" ? (
                    <img
                      src={item.media}
                      className="w-100"
                      style={{ height: 300, objectFit: "cover" }}
                    />
                  ) : (
                    <video
                      src={item.media}
                      className="w-100"
                      style={{ height: 300, objectFit: "cover" }}
                    />
                  )
                ) : (
                  <>
                    <img
                      src={item.thumb}
                      className="w-100"
                      style={{ height: 300, objectFit: "cover" }}
                    />

                    <FaPlay
                      className="position-absolute top-50 start-50 translate-middle text-white"
                      style={{ fontSize: 60 }}
                    />
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

{/* MODAL */}
{showModal && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100"
    style={{
      backgroundColor: "#080808e6",
      zIndex: 9999,
      overflow: "hidden",
    }}
  >
    {/* CLOSE BUTTON */}
    <button
      className="btn btn-dark position-absolute"
      style={{
        top: "15px",
        right: "15px",
        zIndex: 10000,
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={() => setShowModal(false)}
    >
      <FaTimes />
    </button>

    {/* INSTAGRAM */}
    {activeTab === "instagram" ? (
      <div
        ref={scrollRef}
        className="h-100 w-100 overflow-auto"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {currentData.map((item) => (
          <div
            key={item.id}
            className="d-flex justify-content-center align-items-center"
            style={{
              height: "100vh",
              width: "100%",
              scrollSnapAlign: "start",
              padding: "10px",
            }}
          >
            {/* RESPONSIVE CARD */}
            <div
              className="bg-white rounded overflow-hidden shadow"
              style={{
                width: "100%",
                maxWidth: "420px",
              }}
            >
              {/* HEADER */}
              <div className="d-flex justify-content-between p-2 border-bottom">
                <strong>starestate_official</strong>
                <button className="btn btn-sm btn-primary">
                  Follow
                </button>
              </div>

              {/* MEDIA */}
              {item.type === "image" ? (
                <img
                  src={item.media}
                  className="w-100"
                  style={{
                    height: "clamp(250px, 50vw, 400px)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  src={item.media}
                  controls
                  autoPlay
                  muted
                  className="w-100"
                  style={{
                    height: "clamp(250px, 50vw, 400px)",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* ACTIONS */}
              <div className="p-3">
                <FaHeart className="me-2" />
                <FaRegComment className="me-2" />
                <FaShare className="me-2" />
                <p className="mt-2 mb-0">{item.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      /* YOUTUBE RESPONSIVE */
      <div className="h-100 d-flex justify-content-center align-items-center p-3">
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            aspectRatio: "16/9",
          }}
        >
          <iframe
            src={currentData[selectedIndex].video}
            title="video"
            allow="autoplay"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      </div>
    )}
  </div>
)}
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";

// import {
//   FaInstagram,
//   FaYoutube,
//   FaPlay,
// } from "react-icons/fa";

// import "swiper/css";
// import "swiper/css/navigation";

// export default function SocialFeedsOfMPF() {

//   const [activeTab, setActiveTab] = useState("instagram");

//   const [instagramPosts, setInstagramPosts] = useState([]);

//   const [youtubeVideos, setYoutubeVideos] = useState([]);

//   // ================= INSTAGRAM FETCH =================
//   useEffect(() => {

//     const fetchInstagram = async () => {

//       try {

//         const token = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;

//         const res = await fetch(
//           `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${token}`
//         );

//         const data = await res.json();

//         setInstagramPosts(data.data || []);

//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchInstagram();

//   }, []);

//   // ================= YOUTUBE FETCH =================
//   useEffect(() => {

//     const fetchYoutube = async () => {

//       try {

//         const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

//         const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

//         const res = await fetch(
//           `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`
//         );

//         const data = await res.json();

//         setYoutubeVideos(data.items || []);

//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchYoutube();

//   }, []);

//   const currentData =
//     activeTab === "instagram"
//       ? instagramPosts
//       : youtubeVideos;

//   return (
//     <div className="container py-5">

//       {/* TITLE */}
//       <h2 className="text-center fw-bold mb-4">
//         Social Media Feed
//       </h2>

//       {/* TABS */}
//       <div className="d-flex justify-content-center gap-3 mb-4">

//         <button
//           className={`btn ${
//             activeTab === "instagram"
//               ? "btn-dark"
//               : "btn-outline-dark"
//           }`}
//           onClick={() => setActiveTab("instagram")}
//         >
//           <FaInstagram className="me-2" />
//           Instagram
//         </button>

//         <button
//           className={`btn ${
//             activeTab === "youtube"
//               ? "btn-dark"
//               : "btn-outline-dark"
//           }`}
//           onClick={() => setActiveTab("youtube")}
//         >
//           <FaYoutube className="me-2" />
//           YouTube
//         </button>

//       </div>

//       {/* SLIDER */}
//       <div className="position-relative">

//         {/* PREV */}
//         <button
//           className="social-prev btn btn-dark position-absolute top-50 start-0 translate-middle-y z-3"
//           style={{
//             width: 45,
//             height: 45,
//             borderRadius: "50%",
//           }}
//         >
//           ❮
//         </button>

//         {/* NEXT */}
//         <button
//           className="social-next btn btn-dark position-absolute top-50 end-0 translate-middle-y z-3"
//           style={{
//             width: 45,
//             height: 45,
//             borderRadius: "50%",
//           }}
//         >
//           ❯
//         </button>

//         <Swiper
//           modules={[Navigation]}
//           navigation={{
//             nextEl: ".social-next",
//             prevEl: ".social-prev",
//           }}
//           spaceBetween={20}
//           breakpoints={{
//             320: { slidesPerView: 1 },
//             768: { slidesPerView: 2 },
//             1200: { slidesPerView: 4 },
//           }}
//         >

//           {/* INSTAGRAM */}
//           {activeTab === "instagram" &&
//             currentData.map((item) => (

//               <SwiperSlide key={item.id}>

//                 <a
//                   href={item.permalink}
//                   target="_blank"
//                 >

//                   <img
//                     src={
//                       item.media_type === "VIDEO"
//                         ? item.thumbnail_url
//                         : item.media_url
//                     }
//                     className="w-100 rounded"
//                     style={{
//                       height: 300,
//                       objectFit: "cover",
//                     }}
//                     alt=""
//                   />

//                 </a>

//               </SwiperSlide>
//             ))}

//           {/* YOUTUBE */}
//           {activeTab === "youtube" &&
//             currentData.map((item) => (

//               <SwiperSlide key={item.id.videoId}>

//                 <a
//                   href={`https://www.youtube.com/watch?v=${item.id.videoId}`}
//                   target="_blank"
//                 >

//                   <div className="position-relative">

//                     <img
//                       src={item.snippet.thumbnails.high.url}
//                       className="w-100 rounded"
//                       style={{
//                         height: 300,
//                         objectFit: "cover",
//                       }}
//                       alt=""
//                     />

//                     <FaPlay
//                       className="position-absolute top-50 start-50 translate-middle text-white"
//                       style={{
//                         fontSize: 60,
//                       }}
//                     />

//                   </div>

//                 </a>

//               </SwiperSlide>
//             ))}

//         </Swiper>

//       </div>

//     </div>
//   );
// }
