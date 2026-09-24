import { useMemo, useRef, useState } from "react";
import "../App.css";

function StockImportExport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [uploading, setUploading] = useState(false);

  const [showStock, setShowStock] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fileInputRef = useRef(null);

  const columns = [
    { key: "Plant", label: "Plant" },
    { key: "Section", label: "Section" },
    { key: "StorageLocation", label: "Storage Location" },
    { key: "Grade", label: "Grade" },
    { key: "WeightKg", label: "Weight (Kg)" },
    { key: "BinBagNo", label: "Bin / Bag No" },
    { key: "OrderNo", label: "Order No" },
    { key: "OSAC", label: "OS AC" },
    { key: "Machine", label: "Machine" },
    { key: "Comment", label: "Comment" },
    { key: "ActualIssues", label: "Actual Issues" },
    { key: "Corection", label: "Correction" },
    { key: "QtyKg", label: "Qty (Kg)" },
    { key: "SizeCode", label: "Size Code" },
    { key: "CTC", label: "CTC" },
    { key: "BD", label: "BD" },
    { key: "StockDate", label: "Date" },
    { key: "KilnMachine", label: "Kiln / Machine" },
    { key: "Origin", label: "Origin" },
    { key: "ExKilnSize", label: "Ex Kiln Size" },
    { key: "Location", label: "Location" },
    { key: "Catagary", label: "Category" },
    { key: "NoOfBags", label: "No of Bags" },
    { key: "Mo6", label: "Mo 6%" },
    { key: "NMB", label: "NMB" },
    { key: "NMBNO", label: "NMB No" },
    { key: "Grade1", label: "Grade 1" },
    { key: "CTC1", label: "CTC 1" },
    { key: "BD1", label: "BD 1" },
    { key: "Mo", label: "Mo" },
    { key: "I2", label: "I2" },
    { key: "Ash", label: "Ash" },
    { key: "Sand", label: "Sand" },
    { key: "Magnetic", label: "Magnetic" },
    { key: "WeightKg1", label: "Weight (Kg) 1" },
    { key: "In", label: "In" },
  ];

  const frozenColumns = ["Plant", "Section", "Grade"];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setMessage("");
    setMessageType("");
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    const validExtensions = [".xlsx", ".xls"];

    const fileName = file.name.toLowerCase();

    if (!validExtensions.some((extension) => fileName.endsWith(extension))) {
      setMessage("Please select an Excel file (.xlsx or .xls).");
      setMessageType("error");
      return;
    }

    setSelectedFile(file);
    setMessage("");
    setMessageType("");
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage("Please select an Excel file first.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/stock/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Import failed.");
      }

      setMessage(result.message || "Stock data imported successfully.");
      setMessageType("success");

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setMessage(error.message || "Unable to import the Excel file.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/stock/export"
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.detail || "Export failed.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Stock_Allocation_Export.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Stock data exported successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Unable to export stock data.");
      setMessageType("error");
    }
  };

  const handleViewStock = async () => {
    setShowStock(true);
    setLoadingStock(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/stock"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to load stock.");
      }

      setStockData(result);
    } catch (error) {
      setMessage(error.message || "Unable to load stock data.");
      setMessageType("error");
    } finally {
      setLoadingStock(false);
    }
  };

  const handleCloseStock = () => {
    setShowStock(false);
  };

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setColumnFilters({});
    setSortColumn(null);
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const activeFilterCount =
    Object.values(columnFilters).filter(
      (value) => value && value.trim() !== ""
    ).length + (searchText ? 1 : 0);

  const filteredAndSortedData = useMemo(() => {
    let result = [...stockData];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      result = result.filter((row) =>
        columns.some((column) =>
          String(row[column.key] ?? "")
            .toLowerCase()
            .includes(search)
        )
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value || !value.trim()) {
        return;
      }

      const filterValue = value.toLowerCase();

      result = result.filter((row) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(filterValue)
      );
    });

    if (sortColumn) {
      result.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA == null) return 1;
        if (valueB == null) return -1;

        const numberA = Number(valueA);
        const numberB = Number(valueB);

        let comparison;

        if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
          comparison = numberA - numberB;
        } else {
          comparison = String(valueA).localeCompare(
            String(valueB),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [
    stockData,
    searchText,
    columnFilters,
    sortColumn,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedData.length / pageSize)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredAndSortedData.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [filteredAndSortedData, safeCurrentPage, pageSize]);

  const firstRecord =
    filteredAndSortedData.length === 0
      ? 0
      : (safeCurrentPage - 1) * pageSize + 1;

  const lastRecord = Math.min(
    safeCurrentPage * pageSize,
    filteredAndSortedData.length
  );

  const totalWeight = stockData.reduce(
    (total, row) =>
      total + (Number(row.WeightKg) || 0),
    0
  );

  const totalBags = stockData.reduce(
    (total, row) =>
      total + (Number(row.NoOfBags) || 0),
    0
  );

  const uniquePlants = new Set(
    stockData
      .map((row) => row.Plant)
      .filter(Boolean)
  ).size;

  const getSortIcon = (key) => {
    if (sortColumn !== key) {
      return "↕";
    }

    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatCellValue = (value, key) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (key === "WeightKg" || key === "WeightKg1") {
      const number = Number(value);

      if (!Number.isNaN(number)) {
        return number.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
      }
    }

    if (key === "NoOfBags") {
      const number = Number(value);

      if (!Number.isNaN(number)) {
        return number.toLocaleString();
      }
    }

    if (key === "StockDate") {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB");
      }
    }

    return String(value);
  };

  return (
    <div className="app-shell">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="top-header">
        <div className="brand-area">
          <div className="brand-icon">
            ◈
          </div>

          <div>
            <div className="brand-title">
              Stock Allocation
            </div>

            <div className="brand-subtitle">
              Inventory Management System
            </div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Ready
        </div>
      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="main-content">

        <section className="welcome-section">
          <div>
            <span className="eyebrow">
              INVENTORY CONTROL
            </span>

            <h1>
              Stock Allocation System
            </h1>

            <p>
              Import, review and export your stock allocation
              information from one central workspace.
            </p>
          </div>
        </section>


        {/* ===================================================
            ACTION WORKSPACE
        =================================================== */}
        <section className="workspace-card">

          <div className="section-heading">
            <div>
              <h2>Data Management</h2>
              <p>
                Import your latest stock allocation file or
                export the current database records.
              </p>
            </div>
          </div>


          <div className="management-grid">

            {/* Upload */}
            <div className="upload-panel">

              <div className="panel-label">
                <span className="panel-number">01</span>
                Import Stock
              </div>

              <div
                className={`drop-zone ${
                  selectedFile ? "file-selected" : ""
                }`}
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="upload-icon">
                  ↑
                </div>

                {selectedFile ? (
                  <>
                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <strong>
                      Drop your Excel file here
                    </strong>

                    <span>
                      or click to browse · XLSX / XLS
                    </span>
                  </>
                )}

              </div>

              <button
                className="primary-button full-width"
                onClick={handleImport}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <span>↑</span>
                    Import Excel
                  </>
                )}
              </button>

            </div>


            {/* Export / View */}
            <div className="actions-panel">

              <div className="panel-label">
                <span className="panel-number">02</span>
                Stock Workspace
              </div>

              <div className="action-stack">

                <button
                  className="secondary-button"
                  onClick={handleExport}
                >
                  <span className="button-icon">
                    ↓
                  </span>

                  <span>
                    <strong>Export Stock</strong>
                    <small>
                      Download current records
                    </small>
                  </span>
                </button>


                <button
                  className="dark-button"
                  onClick={handleViewStock}
                >
                  <span className="button-icon">
                    ▦
                  </span>

                  <span>
                    <strong>View Stock</strong>
                    <small>
                      Open read-only inventory
                    </small>
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </button>

              </div>

            </div>

          </div>


          {/* Message */}
          {message && (
            <div
              className={`message-banner ${messageType}`}
            >
              <span>
                {messageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              {message}
            </div>
          )}

        </section>


        {/* ===================================================
            INFORMATION CARDS
        =================================================== */}
        <section className="info-grid">

          <div className="info-card">
            <div className="info-card-icon blue">
              ▦
            </div>

            <div>
              <span>Data Source</span>
              <strong>Azure SQL</strong>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon green">
              ✓
            </div>

            <div>
              <span>Access Mode</span>
              <strong>Read Only</strong>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon purple">
              ↗
            </div>

            <div>
              <span>File Format</span>
              <strong>Excel XLSX</strong>
            </div>
          </div>

        </section>

      </main>


      {/* =====================================================
          STOCK MODAL
      ===================================================== */}
      {showStock && (
        <div className="stock-overlay">

          <div className="stock-modal">

            {/* Modal Header */}
            <div className="stock-modal-header">

              <div>
                <div className="modal-eyebrow">
                  INVENTORY DATABASE
                </div>

                <h2>
                  Stock Inventory
                </h2>

                <p>
                  Read-only view of current stock allocation
                  records.
                </p>
              </div>

              <button
                className="close-button"
                onClick={handleCloseStock}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {loadingStock ? (
              <div className="loading-state">

                <div className="large-spinner"></div>

                <h3>
                  Loading stock data
                </h3>

                <p>
                  Retrieving records from the database...
                </p>

              </div>
            ) : (
              <>

                {/* ==========================================
                    SUMMARY
                ========================================== */}
                <div className="stock-summary">

                  <div className="summary-card">
                    <span>Total Records</span>

                    <strong>
                      {stockData.length.toLocaleString()}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Weight</span>

                    <strong>
                      {totalWeight.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      <small>Kg</small>
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Bags</span>

                    <strong>
                      {totalBags.toLocaleString()}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Plants</span>

                    <strong>
                      {uniquePlants}
                    </strong>
                  </div>

                </div>


                {/* ==========================================
                    TOOLBAR
                ========================================== */}
                <div className="grid-toolbar">

                  <div className="search-box">

                    <span className="search-icon">
                      ⌕
                    </span>

                    <input
                      type="text"
                      placeholder="Search across all columns..."
                      value={searchText}
                      onChange={(event) => {
                        setSearchText(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                    />

                    {searchText && (
                      <button
                        className="clear-search"
                        onClick={() =>
                          setSearchText("")
                        }
                      >
                        ×
                      </button>
                    )}

                  </div>


                  <div className="toolbar-actions">

                    <span className="filter-count">
                      {activeFilterCount > 0
                        ? `${activeFilterCount} filter${
                            activeFilterCount === 1
                              ? ""
                              : "s"
                          } active`
                        : "No filters active"}
                    </span>

                    <button
                      className="clear-filter-button"
                      onClick={clearFilters}
                      disabled={
                        activeFilterCount === 0 &&
                        !sortColumn
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>


                {/* ==========================================
                    TABLE
                ========================================== */}
                <div className="table-wrapper">

                  <table className="stock-table">

                    <thead>

                      <tr className="main-header-row">

                        {columns.map(
                          (column, index) => {
                            const isFrozen =
                              frozenColumns.includes(
                                column.key
                              );

                            return (
                              <th
                                key={column.key}
                                className={
                                  isFrozen
                                    ? `frozen-column frozen-${column.key}`
                                    : ""
                                }
                              >

                                <button
                                  className="column-sort-button"
                                  onClick={() =>
                                    handleSort(
                                      column.key
                                    )
                                  }
                                >
                                  <span>
                                    {column.label}
                                  </span>

                                  <span
                                    className={
                                      sortColumn ===
                                      column.key
                                        ? "sort-active"
                                        : "sort-icon"
                                    }
                                  >
                                    {getSortIcon(
                                      column.key
                                    )}
                                  </span>
                                </button>

                              </th>
                            );
                          }
                        )}

                      </tr>


                      {/* Filter Row */}
                      <tr className="filter-row">

                        {columns.map((column) => {

                          const isFrozen =
                            frozenColumns.includes(
                              column.key
                            );

                          return (
                            <th
                              key={`filter-${column.key}`}
                              className={
                                isFrozen
                                  ? `frozen-column frozen-${column.key}`
                                  : ""
                              }
                            >

                              <input
                                type="text"
                                placeholder="Filter..."
                                value={
                                  columnFilters[
                                    column.key
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleColumnFilterChange(
                                    column.key,
                                    event.target.value
                                  )
                                }
                              />

                            </th>
                          );
                        })}

                      </tr>

                    </thead>


                    <tbody>

                      {paginatedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="empty-state"
                          >
                            <div className="empty-icon">
                              ⌕
                            </div>

                            <strong>
                              No records found
                            </strong>

                            <span>
                              Try changing your search
                              or filters.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(
                          (row, rowIndex) => (
                            <tr key={rowIndex}>

                              {columns.map(
                                (column) => {

                                  const isFrozen =
                                    frozenColumns.includes(
                                      column.key
                                    );

                                  return (
                                    <td
                                      key={column.key}
                                      className={
                                        isFrozen
                                          ? `frozen-column frozen-${column.key}`
                                          : ""
                                      }
                                    >
                                      {formatCellValue(
                                        row[column.key],
                                        column.key
                                      )}
                                    </td>
                                  );
                                }
                              )}

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>


                {/* ==========================================
                    PAGINATION
                ========================================== */}
                <div className="pagination-bar">

                  <div className="pagination-info">

                    Showing{" "}
                    <strong>
                      {firstRecord}
                    </strong>{" "}
                    –{" "}
                    <strong>
                      {lastRecord}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {filteredAndSortedData.length}
                    </strong>{" "}
                    records

                  </div>


                  <div className="pagination-controls">

                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(
                          Number(event.target.value)
                        );
                        setCurrentPage(1);
                      }}
                    >
                      <option value={25}>
                        25 / page
                      </option>

                      <option value={50}>
                        50 / page
                      </option>

                      <option value={100}>
                        100 / page
                      </option>

                      <option value={250}>
                        250 / page
                      </option>

                      <option value={500}>
                        500 / page
                      </option>
                    </select>


                    <button
                      className="page-button"
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          safeCurrentPage - 1
                        )
                      }
                    >
                      ‹
                    </button>


                    <span className="page-number">
                      {safeCurrentPage}
                    </span>


                    <button
                      className="page-button"
                      disabled={
                        safeCurrentPage >= totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          safeCurrentPage + 1
                        )
                      }
                    >
                      ›
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default StockImportExport;