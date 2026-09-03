import React from "react";

export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://algoverse.io/#webapp",
        "name": "AlgoVerse & SortMentor",
        "url": "https://algoverse.io",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description":
          "Interactive Computer Science & Algorithm Learning Platform with 11 custom sorting visualizers, step ghost trails, RAG-powered AI tutoring, and real-time execution replays.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "featureList": [
          "Interactive Sorting Visualizer for 11 algorithms (Quick, Merge, Heap, TimSort, Radix, Bucket, Shell, etc.)",
          "Step Ghost Trails & SVG motion trajectory arcs",
          "RAG-Powered AI Tutor with live visualizer state grounding",
          "Side-by-side Battle Arena mode",
          "Gamified student roadmap & mastery tracking",
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1280",
          "bestRating": "5",
          "worstRating": "1",
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": "https://algoverse.io/#organization",
        "name": "AlgoVerse",
        "url": "https://algoverse.io",
        "logo": "https://algoverse.io/icon.png",
        "sameAs": [
          "https://github.com/jayant132004/company",
        ],
      },
      {
        "@type": "LearningResource",
        "@id": "https://algoverse.io/sortmentor#resource",
        "name": "SortMentor Interactive Sorting Masterclass",
        "description":
          "Visual, step-by-step masterclass covering comparison and non-comparison sorting algorithms, invariants, pseudocode, and asymptotic complexities.",
        "educationalLevel": "Beginner to Advanced Computer Science",
        "learningResourceType": "Interactive Simulation & Tutorial",
        "about": [
          { "@type": "Thing", "name": "Quick Sort" },
          { "@type": "Thing", "name": "Merge Sort" },
          { "@type": "Thing", "name": "Heap Sort" },
          { "@type": "Thing", "name": "Tim Sort" },
          { "@type": "Thing", "name": "Radix Sort" },
          { "@type": "Thing", "name": "Counting Sort" },
          { "@type": "Thing", "name": "Bucket Sort" },
          { "@type": "Thing", "name": "Shell Sort" },
          { "@type": "Thing", "name": "Insertion Sort" },
          { "@type": "Thing", "name": "Selection Sort" },
          { "@type": "Thing", "name": "Bubble Sort" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://algoverse.io/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is SortMentor and how does it help learn algorithms?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "SortMentor is an interactive DSA visualizer and AI tutor. It provides specialized visual structures (like divide-and-conquer trees for Merge Sort, binary heap graphs for Heap Sort, and bucket cups for Bucket Sort) along with real-time AI explanations of every comparison and swap step.",
            },
          },
          {
            "@type": "Question",
            "name": "Which sorting algorithm is the fastest in practice?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "In real-world standard libraries (such as Python's list.sort and Java's Arrays.sort), TimSort is standard due to its adaptive O(n) performance on partially sorted real data and guaranteed O(n log n) worst-case time. For general in-memory primitive sorting, QuickSort is often fastest due to cache locality.",
            },
          },
          {
            "@type": "Question",
            "name": "What are Step Ghost Trails in the visualizer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Step Ghost Trails render dynamic SVG trajectory flight paths and faint origin placeholders that visually anchor where swapped elements originated, eliminating spatial disorientation during fast algorithm execution.",
            },
          },
          {
            "@type": "Question",
            "name": "Is AlgoVerse free for computer science students?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes, AlgoVerse is 100% free and open for students, educators, and software engineers preparing for technical interviews.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://algoverse.io",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Dashboard",
            "item": "https://algoverse.io/dashboard",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "SortMentor Studio",
            "item": "https://algoverse.io/sortmentor",
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
