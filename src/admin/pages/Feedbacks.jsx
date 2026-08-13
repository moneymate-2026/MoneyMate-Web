import { useState, useRef, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Download, Filter, Star, ChevronDown, Check } from "lucide-react";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]); // Empty array as requested, ready for backend data
  const [loading, setLoading] = useState(false);
  const [starFilter, setStarFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columns = [
    { 
      header: "User", 
      render: (row) => (
        <div>
          <p className="font-medium text-admin-on-surface">{row.name}</p>
          <p className="text-xs text-admin-on-surface-variant">{row.email}</p>
        </div>
      )
    },
    { 
      header: "Rating", 
      render: (row) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < row.rating ? "text-amber-400 fill-amber-400" : "text-admin-outline-variant"}`} 
            />
          ))}
        </div>
      )
    },
    { 
      header: "Description", 
      render: (row) => (
        <p className="text-sm text-admin-on-surface-variant max-w-md truncate" title={row.description}>
          {row.description}
        </p>
      )
    },
    { 
      header: "Date", 
      accessor: "date" 
    }
  ];

  // Filtering and sorting logic (ready for when data is fetched)
  const filteredFeedbacks = feedbacks.filter(f => 
    starFilter === "all" ? true : f.rating === parseInt(starFilter)
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Latest first

  const filterOptions = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">Feedbacks</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center bg-admin-surface-container border border-admin-outline-variant rounded-lg px-4 py-2 gap-2 hover:border-admin-primary/50 transition-colors text-sm font-medium text-admin-on-surface w-[150px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-admin-on-surface-variant" />
                <span>{filterOptions.find(o => o.value === starFilter)?.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-admin-on-surface-variant transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[160px] bg-admin-surface-container border border-admin-outline-variant rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStarFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                        starFilter === option.value 
                          ? "bg-admin-primary/10 text-admin-primary font-bold" 
                          : "text-admin-on-surface hover:bg-admin-surface-container-high"
                      }`}
                    >
                      {option.label}
                      {starFilter === option.value && <Check className="w-4 h-4 text-admin-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="px-4 py-2 bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg font-semibold shadow-sm hover:bg-admin-surface-container-low transition-colors flex items-center gap-2"
            onClick={() => alert("PDF Export will be integrated with the backend")}
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <div className="w-8 h-8 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <DataTable columns={columns} data={filteredFeedbacks} className="border-0 shadow-none rounded-none flex-1" />
        ) : (
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <Star className="w-12 h-12 text-admin-outline-variant mb-4 opacity-50" />
            <p className="font-medium text-lg text-admin-on-surface">No feedbacks found</p>
            <p className="text-sm mt-1">User feedbacks will appear here once submitted.</p>
          </div>
        )}

        {/* Pagination UI */}
        <div className="p-4 border-t border-admin-outline-variant flex items-center justify-between text-sm text-admin-on-surface-variant mt-auto">
          <div>
            Showing <span className="font-semibold text-admin-on-surface">{filteredFeedbacks.length}</span> results
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container text-admin-primary bg-admin-surface-container">1</button>
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
