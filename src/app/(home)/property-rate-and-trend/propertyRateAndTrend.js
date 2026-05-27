"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./page.module.css";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import CityData from "./tables/citydata";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
export default function PropertyRateAndTrend({ cityList1, insightsArray }) {
    const [cityName, setCityName] = useState("");
    const cityList = ['Ghaziabad', 'Mumbai', 'Noida'];
    const pathname = usePathname();
    const router = useRouter();
    const data = [
        {
            id: 1,
            img: "https://www.squareyards.com/assets/images/transaction-benefit-images/transfer-money-buy-smartphone-hands.svg",
            heading: "For Home Buyers",
            paragraph:
                "Pick a building or locality of your interest and see last 10 actual transactions before you negotiate with a broker or a builder.",
        },
        {
            id: 2,
            img: "https://www.squareyards.com/assets/images/transaction-benefit-images/hand-building.svg",
            heading: "For Renters",
            paragraph:
                "Get accurate value of recent lease deeds of the building or society that you are planning to rent. Our users can save 5-10% by referring to actual transactions.",
        },
        {
            id: 3,
            img: "https://www.squareyards.com/assets/images/transaction-benefit-images/fci-calculator.svg",
            heading: "For Owners",
            paragraph:
                "See you building's or project's sale and lease transaction history to get realistic valuation of your property.",
        },
    ];

    const [searchInput, setSearchInput] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.trim() === '') {
            setFilteredCities([]);
            return;
        }

        const filtered = cityList.filter((city) =>
            city.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCities(filtered.length > 0 ? filtered : ['No record found']);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion !== 'No record found') {
            // setSearchInput(suggestion);
            setCityName(suggestion);
            router.push(`/property-rate-and-trend/${suggestion}`);
            setFilteredCities([]);
        }
    };
    return (
        <>
            <div className="mt-5">
                <h1 className="text-center">Property Rates In India</h1>
                <div className="d-flex my-5 position-relative justify-content-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6 position-relative">
                                <div className="input-group border shadow rounded-pill overflow-hidden p-2 bg-light">
                                    {/* City Dropdown */}
                                    <select
                                        value={cityName}
                                        onChange={(e) => {
                                            setCityName(e.target.value);
                                            setSearchInput(e.target.value);
                                            router.push(`/property-rate-and-trend/${e.target.value?.toLowerCase()}`);
                                        }}
                                        className="form-select border-0 rounded-0 rounded-start-pill bg-light text-dark px-3"
                                        style={{ maxWidth: '150px' }}
                                    >
                                        <option value="">Select city</option>
                                        {cityList.map((item, index) => (
                                            <option key={`${item}-${index}`} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Search Input */}
                                    <input
                                        type="text"
                                        className="form-control border-0 bg-light text-dark"
                                        placeholder="Type any city for search"
                                        value={searchInput}
                                        onChange={handleSearchChange}
                                    />

                                    {/* Search Icon Button */}
                                    <button className="btn btn-light px-4" type="button">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>

                                {/* Search Suggestions */}
                                {searchInput && (
                                    <div className="position-absolute w-100 bg-white border rounded shadow mt-1" style={{ zIndex: 10 }}>
                                        {filteredCities.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className={`px-3 py-2 ${suggestion !== 'No record found' ? 'cursor-pointer' : 'text-muted'}`}
                                                style={{ cursor: suggestion !== 'No record found' ? 'pointer' : 'default' }}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-5">
                    <h3 className="text-center mb-4">Check property Rates in Cities</h3>
                    <div className={`d-flex flex-wrap gap-3 justify-content-center`}>
                        {/* {cityList.map((item, index) => (
                            <Link href={`/property-rate-and-trend/${item.name.toLowerCase()}`} key={index + 1}>{item.name}</Link>
                        ))} */}
                        {['Ghaziabad', 'Mumbai', 'Noida'].map((item, index) => (
                            <Link title={`View ${item} property rates`} className={`${styles.customLink} px-3 py-1 border border-success rounded-5 
                            text-black ${pathname === `/property-rate-and-trend/${item?.toLowerCase()}` ? styles.linkActive : ''}`}
                                href={`/property-rate-and-trend/${item?.toLowerCase()}`} key={index + 1}>{item}</Link>
                        ))}
                    </div>
                </div>
                <div className="container mb-5">
                    <div className="row">
                        {insightsArray.map((insightData, index) => (
                            <div key={index} className="col-12 col-md-6 mb-5">
                                <div>
                                    <h5 className="mb-3">{insightData.title}</h5>
                                    <CityData insightData={insightData.data} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="h1 text-center">In Numbers</p>
                    <div className={styles.propertyRateNumbers}>
                        <div className={styles.propertyRateNumbersChild}>
                            <div className="d-flex justify-content-start align-items-center ">
                                <p className={styles.propertyRateDigit}>8.6</p>
                                <span className={`${styles.propertyRateMn} fw-bold`}>mn+</span>
                            </div>
                            <p className="fs-4 mt-4 fw-normal">Transaction Records</p>
                        </div>
                        <div className={styles.propertyRateNumbersChild}>
                            <div className="d-flex justify-content-start align-items-center ">
                                <p className={styles.propertyRateDigit}>140</p>
                                <span className={`${styles.propertyRateMn} fw-bold`}>k+</span>
                            </div>
                            <p className="fs-4 mt-4 fw-normal">Projects Covered</p>
                        </div>
                        <div className={styles.propertyRateNumbersChild}>
                            <div className="d-flex justify-content-start align-items-center ">
                                <p className={styles.propertyRateDigit}>11</p>
                                <span className={`${styles.propertyRateMn} fw-bold`}>+</span>
                            </div>
                            <p className="fs-4 mt-4 fw-normal mx-3">Cities</p>
                        </div>
                    </div>
                </div>
                <div className="my-5">
                    <div className="d-flex justify-content-center">
                        <p className="fs-1 text-center w-75">
                            Check Current Market Value of any Property Buy, Lease or Sell with
                            Confidence
                        </p>
                    </div>
                </div>
                <div className="d-flex justify-content-center align-items-center my-3 gap-3 flex-wrap">
                    {data.map((item) => (
                        <div key={item.id} className={`p-3 border rounded-5 ${styles.valueCheckContainer}`}>
                            <div className="d-flex justify-content-center my-3">
                                <img className="w-25" src={item.img} alt={item.img} />
                            </div>
                            <p className="h3 text-center my-3">{item.heading}</p>
                            <p className="text-center fs-5">{item.paragraph}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
