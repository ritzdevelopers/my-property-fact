"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./NewLocateScore.module.css";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

const LOCATE_FACTORS = [
  "Local Economy",
  "Ongoing Projects",
  "Connectivity",
  "Amenities",
  "Trends",
  "Existing Supply-Demand",
];

const CHART_COLORS = [
  "#0d5834",
  "#166534",
  "#15803d",
  "#22c55e",
  "#4ade80",
  "#86efac",
];

export default function NewLocateScore() {
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [allLocalities, setAllLocalities] = useState([]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchScore = async (cityName, localityName) => {
    setScoreError(null);
    setScoreResult(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LOCATE_SCORE_API_URL}api/input`,
        { city: cityName, sector: localityName },
      );
      if (response.status !== 200) {
        setScoreError(response.data?.message || "Request failed");
        return;
      }
      const id = response.data.id;
      if (!id) {
        setScoreError("No job ID received");
        return;
      }
      let resolved = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        const scoreResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_LOCATE_SCORE_API_URL}api/reply/${id}`,
        );
        if (scoreResponse.status !== 200) {
          setScoreError(scoreResponse.data?.message || "Failed to fetch score");
          return;
        }
        const { status, result, error } = scoreResponse.data;
        if (status === "done") {
          resolved = true;
          if (error) setScoreError(error);
          else if (result) setScoreResult(result);
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!resolved && !scoreError) {
        setScoreError(
          "Score is taking longer than expected. Please try again.",
        );
      }
    } catch (err) {
      setScoreError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  };

  // Fetching all cities
  const fetchAllCities = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}city/all`,
    );
    return response.data;
  };

  useEffect(() => {
    const loadCities = async () => {
      const cities = await fetchAllCities();
      const filtered =
        Array.isArray(cities) && cities.length > 0
          ? cities.filter((c) => c.localities?.length > 0)
          : [];
      setAllCities(filtered);
    };
    loadCities();
  }, []);

  useEffect(() => {
    if (city && locality) {
      const name =
        allCities?.length &&
        allCities.find((c) => (c.slugURL || c.slugUrl) === city)
          ? allCities.find((c) => (c.slugURL || c.slugUrl) === city).cityName
          : city;
      setIsSubmitting(true);
      fetchScore(name, locality).finally(() => setIsSubmitting(false));
    }
  }, [city, locality]);

  // city locality list
  const cityLocalityList = [
    {
      city: "Mumbai",
      locality: [
        {
          localityName: "Andheri",
          localityId: "101",
        },
        {
          localityName: "Borivali",
          localityId: "102",
        },
        {
          localityName: "Malad",
          localityId: "103",
        },
      ],
    },
    {
      city: "Noida",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "201",
        },
        {
          localityName: "Sector 19",
          localityId: "202",
        },
        {
          localityName: "Sector 21",
          localityId: "203",
        },
      ],
    },
    {
      city: "Gurgaon",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "301",
        },
        {
          localityName: "Sector 19",
          localityId: "302",
        },
        {
          localityName: "Sector 21",
          localityId: "303",
        },
      ],
    },
    {
      city: "Pune",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "401",
        },
      ],
    },
    {
      city: "Chennai",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "501",
        },
        {
          localityName: "Sector 19",
          localityId: "402",
        },
        {
          localityName: "Sector 21",
          localityId: "403",
        },
        {
          localityName: "Sector 22",
          localityId: "404",
        },
        {
          localityName: "Sector 23",
          localityId: "405",
        },
        {
          localityName: "Sector 24",
          localityId: "406",
        },
        {
          localityName: "Sector 25",
          localityId: "407",
        },
      ],
    },
    {
      city: "Hyderabad",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "601",
        },
      ],
    },
    {
      city: "faridabad",
      locality: [
        {
          localityName: "Sector 18",
          localityId: "701",
        },
      ],
    },
  ];

  // Build chart data from new API result.categories
  const chartData = useMemo(() => {
    const categories = scoreResult?.categories;
    if (!Array.isArray(categories) || categories.length === 0) return null;
    const labels = categories.map((c) => c.name?.split(" & ")[0] || c.name || c.code);
    const values = categories.map((c) => Number(c.score) ?? 0);
    return {
      bar: {
        xAxis: [{ scaleType: "band", data: labels }],
        series: [
          { data: values, type: "bar", label: "Score", color: "#0d5834" },
        ],
      },
      pie: categories.map((c, i) => ({
        id: i,
        value: Number(c.score) ?? 0,
        label: c.name?.split(" & ")[0] || c.name || c.code,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    };
  }, [scoreResult?.categories]);

  // Resolve city name from slug for the external LOCATE score API
  const cityNameForScore =
    city && allCities?.length
      ? (allCities.find((c) => (c.slugURL || c.slugUrl) === city)?.cityName ?? city)
      : city;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetchScore(cityNameForScore, locality);
    setIsSubmitting(false);
  };

  // Handling city change - receives slug and fetches localities
  const handleCityChange = async (slug) => {
    setCity(slug);
    setLocality("");
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}city/get/${slug}`,
    );
    if (response.status !== 200) {
      setScoreError(response.data?.message || "Request failed");
      return;
    }
    const localities = response.data?.localities ?? [];
    setAllLocalities(localities);
  };

  return (
    <section className={styles.section} aria-labelledby="locate-score-heading">
      <div className="container">
        <div className={styles.wrapper}>
          <h2 id="locate-score-heading" className={styles.heading}>
            LOCATE Score Analysis
          </h2>
          <p className={styles.subheading}>
            The LOCATE Score is My Property Fact&apos;s proprietary 1000-point
            framework that evaluates any location using six critical factors. It
            helps buyers and investors compare cities and micro-markets
            objectively, understand long-term growth potential, and make
            smarter, data-driven real-estate decisions with clarity and
            confidence.
          </p>

          <div className={styles.factors}>
            {LOCATE_FACTORS.map((factor) => (
              <span key={factor} className={styles.factorPill}>
                {factor}
              </span>
            ))}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Get your LOCATE Score</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="locate-city" className={styles.label}>
                    City
                  </label>
                  <select
                    id="locate-city"
                    className={styles.select}
                    onChange={(e) => handleCityChange(e.target.value)}
                    value={city || ""}
                    aria-label="Select city"
                  >
                    <option value="">Select a City</option>
                    {allCities &&
                      allCities.map((c, index) => (
                        <option
                          key={`${c.slugURL || c.slugUrl || c.cityName}_${index}`}
                          value={c.slugURL || c.slugUrl || c.cityName}
                        >
                          {c.cityName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="locate-locality" className={styles.label}>
                    Locality
                  </label>
                  <select
                    name="locate-locality"
                    id="locate-locality"
                    className={styles.select}
                    onChange={(e) => setLocality(e.target.value)}
                    value={locality}
                    aria-label="Select locality"
                    disabled={!city}
                  >
                    <option value="">Select a Locality</option>
                    {allLocalities.length > 0
                      ? allLocalities.map((loc, idx) => (
                          <option
                            key={loc.localityName ? `${loc.localityName}_${idx}` : idx}
                            value={loc.localityName}
                          >
                            {loc.localityName}
                          </option>
                        ))
                      : cityLocalityList
                          .find((c) => c.city === city)
                          ?.locality.map((loc) => (
                            <option key={loc.localityName} value={loc.localityName}>
                              {loc.localityName}
                            </option>
                          ))}
                  </select>
                </div>
                <div className={styles.fieldGroupBtn}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting || !city || !locality}
                  >
                    {isSubmitting ? "Getting Score…" : "Get Score"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {scoreError && (
            <div className={styles.errorBanner} role="alert">
              {scoreError}
            </div>
          )}

          {isSubmitting && (
            <div className={styles.skeletonWrap} aria-hidden="true" aria-busy="true">
              <div className={styles.skeletonHero}>
                <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
                <div className={styles.skeletonGauge} />
                <div className={styles.skeletonGradeRow}>
                  <div className={styles.skeletonPill} />
                  <div className={styles.skeletonPill} />
                  <div className={styles.skeletonPill} />
                </div>
              </div>
              <div className={styles.skeletonFocus}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
              <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonChartTitle}`} />
                  <div className={styles.skeletonChart} />
                </div>
                <div className={styles.chartCard}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonChartTitle}`} />
                  <div className={styles.skeletonPie} />
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={`${styles.skeletonLine} ${styles.skeletonSummaryTitle}`} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.categoriesGrid}>
                {[1, 2].map((i) => (
                  <div key={i} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <div className={`${styles.skeletonLine} ${styles.skeletonCategoryName}`} />
                      <div className={styles.skeletonPill} />
                    </div>
                    <div className={styles.skeletonLine} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                  </div>
                ))}
              </div>
              <div className={styles.interpretationRow}>
                <div className={styles.interpretationCard}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonInterpretTitle}`} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
                <div className={`${styles.interpretationCard} ${styles.watchOutsCard}`}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonInterpretTitle}`} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
              </div>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.recommendationsGrid}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.recoBlock}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonRecoLabel}`} />
                    <div className={styles.skeletonLine} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                  </div>
                ))}
              </div>
              <div className={styles.verdictCard}>
                <div className={`${styles.skeletonLine} ${styles.skeletonSummaryTitle}`} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
              <div className={styles.skeletonSectionTitle} />
              <ul className={styles.infrastructureList}>
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className={styles.infrastructureItem}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonInfraName}`} />
                    <div className={styles.skeletonInfraMeta} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scoreResult && (
            <article
              className={styles.scoreAnalysis}
              aria-labelledby="score-location"
            >
              <header className={styles.scoreHero}>
                <h3 id="score-location" className={styles.scoreLocation}>
                  {scoreResult.cityName} · {scoreResult.localityName || scoreResult.altName}
                </h3>
                {scoreResult.state && (
                  <p className={styles.scoreMeta}>{scoreResult.state}</p>
                )}
                <div className={styles.gaugeWrap}>
                  {isMounted && (() => {
                    const summary = scoreResult.summary;
                    const total = Number(summary?.totalScore) ?? 0;
                    const maxTotal = Number(summary?.maxTotalScore) ?? 1000;
                    const displayValue = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                    return (
                      <Gauge
                        value={displayValue}
                        valueMin={0}
                        valueMax={100}
                        startAngle={-110}
                        endAngle={110}
                        innerRadius="78%"
                        outerRadius="100%"
                        className={styles.gauge}
                        sx={{
                          [`& .${gaugeClasses.valueArc}`]: { fill: "#0d5834" },
                          [`& .${gaugeClasses.referenceArc}`]: {
                            fill: "rgba(13, 88, 52, 0.12)",
                          },
                          [`& .${gaugeClasses.valueText}`]: {
                            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                            fontWeight: 700,
                            fill: "#0c2e23",
                          },
                        }}
                        text={({ value }) => (value != null ? `${value}` : "")}
                        aria-labelledby="score-location"
                      />
                    );
                  })()}
                </div>
                <div className={styles.scoreGradeRow}>
                  {scoreResult.summary?.grade && (
                    <span className={styles.scoreGrade}>{scoreResult.summary.grade}</span>
                  )}
                  {scoreResult.summary?.gradeLabel && (
                    <span className={styles.scoreLabel}>{scoreResult.summary.gradeLabel}</span>
                  )}
                  {scoreResult.summary?.totalScore != null && (
                    <span className={styles.scoreTotal}>
                      {scoreResult.summary.totalScore} / {scoreResult.summary.maxTotalScore ?? 1000}
                    </span>
                  )}
                </div>
              </header>

              {scoreResult.focus && (
                <div className={styles.focusCard}>
                  <p className={styles.focusText}>{scoreResult.focus}</p>
                </div>
              )}

              {chartData && isMounted && (
                <div className={styles.chartsRow}>
                  <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>Category scores</h4>
                    <div className={styles.chartInner}>
                      <BarChart
                        xAxis={chartData.bar.xAxis}
                        series={chartData.bar.series}
                        width={340}
                        height={280}
                        margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
                        colors={CHART_COLORS}
                        borderRadius={6}
                        barLabel="value"
                        slotProps={{
                          legend: { hidden: true },
                        }}
                        sx={{
                          "& .MuiChartsAxis-tickLabel": { fontSize: "0.8rem" },
                          "& .MuiChartsAxis-label": { fontSize: "0.85rem" },
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>Score distribution</h4>
                    <div className={styles.chartInner}>
                      <PieChart
                        series={[
                          {
                            data: chartData.pie,
                            innerRadius: 50,
                            outerRadius: 90,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            highlightScope: {
                              fade: "global",
                              highlight: "item",
                            },
                          },
                        ]}
                        width={260}
                        height={220}
                        slotProps={{
                          legend: { hidden: true },
                        }}
                        sx={{
                          "& .MuiChartsLegend-root": { display: "none" },
                        }}
                      />
                      <div className={styles.pieLegend}>
                        {chartData.pie.map((item) => (
                          <span key={item.id} className={styles.pieLegendItem}>
                            <span
                              className={styles.pieLegendDot}
                              style={{ background: item.color }}
                            />
                            {item.label} {item.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scoreResult.summary?.headlineVerdict && (
                <div className={styles.summaryCard}>
                  <h4 className={styles.summaryTitle}>Verdict</h4>
                  <p className={styles.summary}>{scoreResult.summary.headlineVerdict}</p>
                </div>
              )}

              {Array.isArray(scoreResult.categories) && scoreResult.categories.length > 0 && (
                <div className={styles.categoriesSection}>
                  <h4 className={styles.sectionTitle}>LOCATE factors</h4>
                  <div className={styles.categoriesGrid}>
                    {scoreResult.categories.map((cat, idx) => (
                      <div key={cat.code || idx} className={styles.categoryCard}>
                        <div className={styles.categoryHeader}>
                          <span className={styles.categoryName}>{cat.name}</span>
                          <span className={styles.categoryScore}>
                            {cat.score} / {cat.maxScore}
                          </span>
                        </div>
                        {Array.isArray(cat.sections) &&
                          cat.sections.map((sec, sidx) => (
                            <div key={sidx} className={styles.categorySection}>
                              <h5 className={styles.sectionSubtitle}>{sec.title}</h5>
                              <p className={styles.sectionBody}>{sec.body}</p>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(scoreResult.interpretation?.strengths?.length > 0 ||
                scoreResult.interpretation?.watchOuts?.length > 0) && (
                <div className={styles.interpretationRow}>
                  {scoreResult.interpretation.strengths?.length > 0 && (
                    <div className={styles.interpretationCard}>
                      <h4 className={styles.interpretationTitle}>Strengths</h4>
                      <ul className={styles.interpretationList}>
                        {scoreResult.interpretation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {scoreResult.interpretation.watchOuts?.length > 0 && (
                    <div className={`${styles.interpretationCard} ${styles.watchOutsCard}`}>
                      <h4 className={styles.interpretationTitle}>Watch outs</h4>
                      <ul className={styles.interpretationList}>
                        {scoreResult.interpretation.watchOuts.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {scoreResult.recommendations && Object.keys(scoreResult.recommendations).length > 0 && (
                <div className={styles.recommendationsSection}>
                  <h4 className={styles.sectionTitle}>Recommendations</h4>
                  <div className={styles.recommendationsGrid}>
                    {scoreResult.recommendations.microMarketStrategy?.length > 0 && (
                      <div className={styles.recoBlock}>
                        <h5 className={styles.recoLabel}>Micro-market strategy</h5>
                        <ul>
                          {scoreResult.recommendations.microMarketStrategy.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scoreResult.recommendations.developerAndInfra?.length > 0 && (
                      <div className={styles.recoBlock}>
                        <h5 className={styles.recoLabel}>Developer & infrastructure</h5>
                        <ul>
                          {scoreResult.recommendations.developerAndInfra.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scoreResult.recommendations.assetType?.length > 0 && (
                      <div className={styles.recoBlock}>
                        <h5 className={styles.recoLabel}>Asset type</h5>
                        <ul>
                          {scoreResult.recommendations.assetType.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scoreResult.recommendations.holdingHorizon && (
                      <div className={styles.recoBlock}>
                        <h5 className={styles.recoLabel}>Holding horizon</h5>
                        <p>{scoreResult.recommendations.holdingHorizon}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scoreResult.verdictText && (
                <div className={styles.verdictCard}>
                  <h4 className={styles.summaryTitle}>Investment view</h4>
                  <p className={styles.summary}>{scoreResult.verdictText}</p>
                </div>
              )}

              {scoreResult.nearbyLandmarks?.length > 0 && (
                <div className={styles.infrastructure}>
                  <h4 className={styles.infrastructureTitle}>
                    Nearby landmarks
                  </h4>
                  <ul className={styles.infrastructureList}>
                    {scoreResult.nearbyLandmarks.map((item, i) => (
                      <li key={i} className={styles.infrastructureItem}>
                        <span className={styles.infraName}>{item.name}</span>
                        <span className={styles.infraMeta}>
                          {item.category} · {item.distanceKm} km
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
