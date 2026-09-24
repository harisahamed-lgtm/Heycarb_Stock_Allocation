import { useMemo, useRef, useState } from "react";
import "../App.css";

function StockImportExport() {
  const [selectedStockFile, setSelectedStockFile] = useState(null);
  const [selectedSapFile, setSelectedSapFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [uploadingStock, setUploadingStock] = useState(false);

  const [showStock, setShowStock] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const stockFileRef = useRef(null);
  const sapFileRef = useRef(null);

  const columns = [
    { key: "GFP", label: "G/F/P" },
    { key: "Plant", label: "Plant" },
    { key: "Section", label: "Section" },
    { key: "StorageLocation", label: "Storage Location" },
    { key: "Grade", label: "Grade" },
    { key: "WeightKg", label: "Weight (Kg)" },
    { key: "BinBagNo", label: "Bin / Bag No" },
    { key: "OrderNoIssuedOrderNo", label: "Order No / Issued Order No" },
    { key: "OSAC", label: "OS AC" },
    { key: "Machine", label: "Machine" },
    { key: "Comment", label: "Comment" },
    { key: "ActualIssues", label: "Actual Issues" },
    { key: "Corection", label: "Correction" },
    { key: "QtyKg", label: "Qty (Kg)" },
    { key: "SizeCode", label: "Size Code" },
    { key: "CTC", label: "CTC" },
    { key: "BD", label: "BD" },
    { key: "Date", label: "Date" },
    { key: "KilnMachine", label: "Kiln / Machine" },
    { key: "Origin", label: "Origin" },
    { key: "ExKilnSize", label: "Ex Kiln Size" },
    { key: "Location", label: "Location" },
    { key: "Catagary", label: "Category" },
    { key: "No of Bags", label: "No of Bags" },
    { key: "Mo 6%", label: "Mo 6%" },
    { key: "NMB", label: "NMB" },
    { key: "NMB NO", label: "NMB No" },
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

  const showStatus = (text, type = "") => {
    setMessage(text);
    setMessageType(type);
  };

  const isExcelFile = (file) =>
    file &&
    [".xlsx", ".xls"].some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );

  const handleStockFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isExcelFile(file)) {
      showStatus("Please select an Excel file (.xlsx or .xls).", "error");
      return;
    }

    setSelectedStockFile(file);
    showStatus("");
  };

  const handleSapFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isExcelFile(file)) {
      showStatus("Please select an Excel file (.xlsx or .xls).", "error");
      return;
    }

    setSelectedSapFile(file);
    showStatus("");
  };

  const handleStockDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!isExcelFile(file)) {
      showStatus("Please drop an Excel file (.xlsx or .xls).", "error");
      return;
    }

    setSelectedStockFile(file);
    showStatus("");
  };

  const handleSapDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!isExcelFile(file)) {
      showStatus("Please drop an Excel file (.xlsx or .xls).", "error");
      return;
    }

    setSelectedSapFile(file);
    showStatus("");
  };

  // Existing backend functionality is intentionally unchanged.
  const handleImport = async () => {
    if (!selectedStockFile) {
      showStatus("Please select a Stock Allocation Excel file first.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedStockFile);

    setUploadingStock(true);
    showStatus("");

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
        let detail = result.detail || "Import failed.";

        if (typeof detail === "object") {
          detail =
            detail.message ||
            detail.error ||
            JSON.stringify(detail);
        }

        throw new Error(detail);
      }

      showStatus(
        result.message ||
          `Stock allocation imported successfully. ${
            result.rowsInserted ?? ""
          } rows processed.`,
        "success"
      );

      setSelectedStockFile(null);

      if (stockFileRef.current) {
        stockFileRef.current.value = "";
      }
    } catch (error) {
      showStatus(error.message || "Unable to import the stock file.", "error");
    } finally {
      setUploadingStock(false);
    }
  };

  // Existing backend functionality is intentionally unchanged.
  const handleExport = async () => {
    showStatus("");

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

      showStatus("Stock file exported successfully.", "success");
    } catch (error) {
      showStatus(error.message || "Unable to export stock data.", "error");
    }
  };

  // Placeholder only - backend functionality will be added later.
  const handleSapImport = () => {
    if (!selectedSapFile) {
      showStatus("Select the SAP Orders Excel file first.", "error");
      return;
    }

    showStatus(
      "SAP Orders import is ready for implementation. No backend action was performed.",
      "info"
    );
  };

  const handleViewStock = async () => {
    setShowStock(true);
    setLoadingStock(true);

    try {
      const response = await fetch("http://localhost:8000/api/stock");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to load stock.");
      }

      setStockData(result);
    } catch (error) {
      setStockData([]);
      showStatus(error.message || "Unable to load stock data.", "error");
    } finally {
      setLoadingStock(false);
    }
  };

  const handlePlaceholder = (featureName) => {
    showStatus(
      `${featureName} is reserved for the next development phase.`,
      "info"
    );
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
      if (!value || !value.trim()) return;

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

        return sortDirection === "asc" ? comparison : -comparison;
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

  const safeCurrentPage = Math.min(currentPage, totalPages);

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
    (total, row) => total + (Number(row.WeightKg) || 0),
    0
  );

  const totalBags = stockData.reduce(
    (total, row) => total + (Number(row["No of Bags"]) || 0),
    0
  );

  const uniquePlants = new Set(
    stockData.map((row) => row.Plant).filter(Boolean)
  ).size;

  const getSortIcon = (key) => {
    if (sortColumn !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatCellValue = (value, key) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (["WeightKg", "WeightKg1"].includes(key)) {
      const number = Number(value);
      if (!Number.isNaN(number)) {
        return number.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
      }
    }

    if (["No of Bags"].includes(key)) {
      const number = Number(value);
      if (!Number.isNaN(number)) {
        return number.toLocaleString();
      }
    }

    if (key === "Date" || key === "In") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB");
      }
    }

    return String(value);
  };

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="brand-area">
          <div className="brand-icon">
            <span>◆</span>
          </div>

          <div>
            <div className="brand-title">Heycarb PLC</div>
            <div className="brand-subtitle">
              Inventory Management System
            </div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          System Ready
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <span className="eyebrow">INVENTORY CONTROL</span>
          <h1>Stock Allocation</h1>
          <p>
            Import, review and manage stock allocation information
            from one central workspace.
          </p>
        </section>

        <section className="workspace-card">
          <div className="management-grid">
            {/* SECTION 01 */}
            <div className="module-card module-import-stock">
              <div className="module-header">
                <div className="module-index">01</div>
                <div>
                  <h2>Import Stock</h2>
                  <p>Upload the latest stock allocation file.</p>
                </div>
              </div>

              <div
                className={`drop-zone ${
                  selectedStockFile ? "file-selected" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleStockDrop}
                onClick={() => stockFileRef.current?.click()}
              >
                <input
                  ref={stockFileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleStockFileChange}
                  hidden
                />

                <div className="upload-icon">↑</div>

                {selectedStockFile ? (
                  <>
                    <strong title={selectedStockFile.name}>
                      {selectedStockFile.name}
                    </strong>
                    <span>
                      {(selectedStockFile.size / 1024).toFixed(1)} KB · Ready
                      to import
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Drop your Excel file here</strong>
                    <span>or click to browse · XLSX / XLS</span>
                  </>
                )}
              </div>

              <button
                className="primary-button"
                onClick={handleImport}
                disabled={!selectedStockFile || uploadingStock}
              >
                {uploadingStock ? (
                  <>
                    <span className="spinner" />
                    Importing...
                  </>
                ) : (
                  <>
                    <span>↑</span>
                    Import Stock Allocation Excel
                  </>
                )}
              </button>
            </div>

            {/* SECTION 02 */}
            <div className="module-card module-sap">
              <div className="module-header">
                <div className="module-index">02</div>
                <div>
                  <h2>Import Orders from SAP</h2>
                  <p>Prepare the workspace for SAP order imports.</p>
                </div>
              </div>

              <div
                className={`drop-zone ${
                  selectedSapFile ? "file-selected" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleSapDrop}
                onClick={() => sapFileRef.current?.click()}
              >
                <input
                  ref={sapFileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleSapFileChange}
                  hidden
                />

                <div className="upload-icon">↑</div>

                {selectedSapFile ? (
                  <>
                    <strong title={selectedSapFile.name}>
                      {selectedSapFile.name}
                    </strong>
                    <span>
                      {(selectedSapFile.size / 1024).toFixed(1)} KB · Selected
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Drop your Excel file here</strong>
                    <span>or click to browse · XLSX / XLS</span>
                  </>
                )}
              </div>

              <button
                className="primary-button"
                onClick={handleSapImport}
              >
                <span>↑</span>
                Import Orders Excel
              </button>
            </div>

            {/* SECTION 03 */}
            <div className="module-card module-workspace">
              <div className="module-header">
                <div className="module-index">03</div>
                <div>
                  <h2>Stock Workspace</h2>
                  <p>Review and process stock information.</p>
                </div>
              </div>

              <div className="workspace-actions">
                <button
                  className="action-button dark-action"
                  onClick={handleViewStock}
                >
                  <span className="action-icon">▦</span>
                  <span className="action-copy">
                    <strong>View Stock</strong>
                    <small>Open read-only inventory</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-button"
                  onClick={() =>
                    handlePlaceholder("Process Stock Allocation")
                  }
                >
                  <span className="action-icon process-icon">◎</span>
                  <span className="action-copy">
                    <strong>Process Stock Allocation</strong>
                    <small>Process and allocate stock</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-button"
                  onClick={handleExport}
                >
                  <span className="action-icon">↓</span>
                  <span className="action-copy">
                    <strong>Export Stock File</strong>
                    <small>Download current records</small>
                  </span>
                  <span className="action-arrow">↓</span>
                </button>
              </div>
            </div>

            {/* SECTION 04 */}
            <div className="module-card module-masters">
              <div className="module-header">
                <div className="module-index">04</div>
                <div>
                  <h2>Import Masters / Setups</h2>
                  <p>Reference data and configuration files.</p>
                </div>
              </div>

              <div className="master-actions">
                <button
                  className="action-button compact-action"
                  onClick={() => handlePlaceholder("Grade Mapping")}
                >
                  <span className="action-icon">↓</span>
                  <span className="action-copy">
                    <strong>Grade Mapping</strong>
                    <small>Download current records</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-button compact-action"
                  onClick={() => handlePlaceholder("Grade Yield")}
                >
                  <span className="action-icon">↓</span>
                  <span className="action-copy">
                    <strong>Grade Yield</strong>
                    <small>Download current records</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className={`message-banner ${messageType}`}>
              <span className="message-icon">
                {messageType === "success"
                  ? "✓"
                  : messageType === "info"
                  ? "i"
                  : "!"}
              </span>
              <span>{message}</span>
            </div>
          )}
        </section>

        <section className="info-grid">
          <div className="info-card">
            <div className="info-card-icon blue">▦</div>
            <div>
              <span>Data Source</span>
              <strong>Azure SQL</strong>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon green">✓</div>
            <div>
              <span>Access Mode</span>
              <strong>Read Only</strong>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon purple">↗</div>
            <div>
              <span>File Format</span>
              <strong>Excel XLSX</strong>
            </div>
          </div>
        </section>
      </main>

      {showStock && (
        <div className="stock-overlay">
          <div className="stock-modal">
            <div className="stock-modal-header">
              <div>
                <div className="modal-eyebrow">INVENTORY DATABASE</div>
                <h2>Stock Inventory</h2>
                <p>
                  Read-only view of current stock allocation records.
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowStock(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {loadingStock ? (
              <div className="loading-state">
                <div className="large-spinner" />
                <h3>Loading stock data</h3>
                <p>Retrieving records from the database...</p>
              </div>
            ) : (
              <>
                <div className="stock-summary">
                  <div className="summary-card">
                    <span>Total Records</span>
                    <strong>{stockData.length.toLocaleString()}</strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Weight</span>
                    <strong>
                      {totalWeight.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      <small>Kg</small>
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Bags</span>
                    <strong>{totalBags.toLocaleString()}</strong>
                  </div>

                  <div className="summary-card">
                    <span>Plants</span>
                    <strong>{uniquePlants}</strong>
                  </div>
                </div>

                <div className="grid-toolbar">
                  <div className="search-box">
                    <span className="search-icon">⌕</span>
                    <input
                      type="text"
                      placeholder="Search across all columns..."
                      value={searchText}
                      onChange={(event) => {
                        setSearchText(event.target.value);
                        setCurrentPage(1);
                      }}
                    />

                    {searchText && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchText("")}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="toolbar-actions">
                    <span className="filter-count">
                      {activeFilterCount > 0
                        ? `${activeFilterCount} filter${
                            activeFilterCount === 1 ? "" : "s"
                          } active`
                        : "No filters active"}
                    </span>

                    <button
                      className="clear-filter-button"
                      onClick={clearFilters}
                      disabled={
                        activeFilterCount === 0 && !sortColumn
                      }
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="stock-table">
                    <thead>
                      <tr className="main-header-row">
                        {columns.map((column) => {
                          const isFrozen = frozenColumns.includes(column.key);

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
                                onClick={() => handleSort(column.key)}
                              >
                                <span>{column.label}</span>
                                <span
                                  className={
                                    sortColumn === column.key
                                      ? "sort-active"
                                      : "sort-icon"
                                  }
                                >
                                  {getSortIcon(column.key)}
                                </span>
                              </button>
                            </th>
                          );
                        })}
                      </tr>

                      <tr className="filter-row">
                        {columns.map((column) => {
                          const isFrozen = frozenColumns.includes(column.key);

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
                                value={columnFilters[column.key] || ""}
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
                            <div className="empty-icon">⌕</div>
                            <strong>No records found</strong>
                            <span>
                              Try changing your search or filters.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columns.map((column) => {
                              const isFrozen = frozenColumns.includes(
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
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-bar">
                  <div className="pagination-info">
                    Showing <strong>{firstRecord}</strong> –{" "}
                    <strong>{lastRecord}</strong> of{" "}
                    <strong>{filteredAndSortedData.length}</strong> records
                  </div>

                  <div className="pagination-controls">
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                      <option value={250}>250 / page</option>
                      <option value={500}>500 / page</option>
                    </select>

                    <button
                      className="page-button"
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage(safeCurrentPage - 1)
                      }
                    >
                      ‹
                    </button>

                    <span className="page-number">{safeCurrentPage}</span>

                    <button
                      className="page-button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage(safeCurrentPage + 1)
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
