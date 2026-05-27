"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../page.module.css";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import CommonTableForInsight from "../tables/commonTable";
import { usePathname, useRouter } from "next/navigation";

export default function PropertyRateAndTrendByCity({ cityList1, insightArray, cityName }) {
    const [name, setName] = useState("");
    const pathname = usePathname();
    const router = useRouter();
    const cityList = ['Ghaziabad', 'Mumbai', 'Noida'];
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
            setName(suggestion);
            router.push(`/property-rate-and-trend/${suggestion}`);
            setFilteredCities([]);
        }
    };
    useEffect(() => {
        setName(cityName);
    }, []);
    return (
        <>
            <div className="mt-5">
                <h1 className="text-center">Property Rates In {cityName}</h1>
                <div className="d-flex my-5 position-relative justify-content-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6 position-relative">
                                <div className="input-group border shadow rounded-pill overflow-hidden p-2 bg-light">
                                    {/* City Dropdown */}
                                    <select
                                        value={cityName}
                                        onChange={(e) => {
                                            setName(e.target.value);
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
                    {/* <p className="h2 text-center">Property Rates in cities of {cityName}</p> */}
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
                        {insightArray.map((insightData, index) => (
                            <div key={index} className="col-12 col-md-6 mb-5">
                                <div>
                                    <h5 className="mb-3">{insightData.title}</h5>
                                    <CommonTableForInsight insightData={insightData.data} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}