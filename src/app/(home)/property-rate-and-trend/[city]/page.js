import axios from "axios";
import { redirect } from "next/navigation";
import PropertyRateAndTrendByCity from "./propertyRateAndTrendByCity";
import indiaInsight from "../../../_global_components/insight-india-data.json";
import {
  getDisplayCityList,
  resolveCitySlug,
} from "@/app/_global_components/cityAliasUtils";
import SeoNarrative from "@/app/_global_components/seo/SeoNarrative";
export const dynamic = 'force-dynamic';
// fetching all cities
const fetchAllCities = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}city/all`);
    return response.data;
}
export default async function PropertyRateAndTrendByCityPage({ params }) {
    const allCities = getDisplayCityList(await fetchAllCities());
    const { city } = await params;
    const canonicalCity = resolveCitySlug(city);
    if (canonicalCity && canonicalCity !== String(city).toLowerCase().trim()) {
        redirect(`/property-rate-and-trend/${canonicalCity}`);
    }
    const cityForPage = canonicalCity || city;
    const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const insightsArray = [
        {
            title: `Micromarket Average Price in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`microMarketAveragePriceForCity${capitalizeFirst(cityForPage)}`],
        },
        {
            title: `Most Active Localities in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`mostActiveLocalitiesForCity${capitalizeFirst(cityForPage)}`],
        },
        {
            title: `Top Selling Projects by Transactions in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`topSellingProjectsByTransactionsForCity${capitalizeFirst(cityForPage)}`],
        },
        {
            title: `Top Selling Projects by Value in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`topSellingProjectsByValueForCity${capitalizeFirst(cityForPage)}`],
        },
        {
            title: `Top Developers by Transactions in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`topDevelopersByTransactionsForCity${capitalizeFirst(cityForPage)}`],
        },
        {
            title: `Top Developers by Value in ${capitalizeFirst(cityForPage)}`,
            data: indiaInsight[`topDevelopersByValueForCity${capitalizeFirst(cityForPage)}`],
        },
    ];    
    const cityLabel = capitalizeFirst(cityForPage);
    const seoSummary = `Compare property rates, price trends, micromarket averages, and transaction activity in ${cityLabel} with My Property Fact market insights and locality data.`;

    return (
        <>
            <SeoNarrative>{seoSummary}</SeoNarrative>
            <PropertyRateAndTrendByCity cityList={allCities}
                insightArray={insightsArray}
                cityName={cityLabel}
            />
        </>
    )
}