// file: edit.js
/**
 * Retrieves the data URL from a global variable set by `wp_localize_script`.
 * This is a common and robust method for passing server-side data to client-side scripts in WordPress.
 */
const DATA_URL = typeof AAG_PLUGIN_DATA !== 'undefined' ? AAG_PLUGIN_DATA.csvUrl : '';

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss'; // Use the front-end styles for consistency in the editor

// A helper function to parse CSV data into an array of objects
const parseCSV = (csv) => {
	// Split the CSV string into lines
	const lines = csv.split('\n').filter(line => line.trim() !== '');
	if (lines.length === 0) return [];

	// Extract headers from the first line and trim whitespace
	const headers = lines[0].split(',').map(header => header.trim());
	const data = [];

	// Process each line after the header
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map(value => value.trim());
		const row = {};
		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = values[j];
		}
		data.push(row);
	}
	return data;
};

/**
 * This is the Edit component for the block, which is displayed in the Gutenberg editor.
 * It provides the interface for previewing and interacting with the data table.
 */
export default function Edit() {
	const blockProps = useBlockProps();

	// State to hold the original, filtered, and sorted data.
	const [allData, setAllData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);

	// State for the user's filter/search input.
	const [filterText, setFilterText] = useState('');

	// State for sorting: the column key and direction ('asc' or 'desc').
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

	// The useEffect hook is used here to perform side effects, in this case, fetching the data.
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Use the global URL to fetch the CSV file.
				const response = await fetch(DATA_URL);
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const csvText = await response.text();
				const parsedData = parseCSV(csvText);

				if (Array.isArray(parsedData) && parsedData.length > 0) {
					setAllData(parsedData);
					setFilteredData(parsedData); // Initially, filtered data is all data.
				} else {
					console.error("Parsed data is not a valid array or is empty.");
				}
			} catch (error) {
				console.error("Failed to fetch or parse CSV:", error);
			}
		};

		if (DATA_URL) {
			fetchData();
		}
	}, []); // The empty dependency array ensures this runs only once on mount.

	// This useEffect handles filtering the data whenever the `filterText` or `allData` changes.
	useEffect(() => {
		let currentData = [...allData];
		if (filterText) {
			const lowercasedFilter = filterText.toLowerCase();
			currentData = currentData.filter(row =>
				Object.values(row).some(value =>
					String(value).toLowerCase().includes(lowercasedFilter)
				)
			);
		}
		setFilteredData(currentData);
	}, [filterText, allData]);

	// This function handles the sorting logic.
	const requestSort = (key) => {
		let direction = 'asc';
		// If the same key is clicked, reverse the direction.
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });

		// Sort the data in-place and update the state.
		const sorted = [...filteredData].sort((a, b) => {
			if (a[key] < b[key]) {
				return direction === 'asc' ? -1 : 1;
			}
			if (a[key] > b[key]) {
				return direction === 'asc' ? 1 : -1;
			}
			return 0;
		});
		setFilteredData(sorted);
	};

	// Get the keys from the first object to use as table headers.
	const headers = allData.length > 0 ? Object.keys(allData[0]) : [];

	// Render a message while the data is loading.
	if (allData.length === 0) {
		return (
			<div {...blockProps}>
				<p>Loading data...</p>
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<div className="aag-data-table__container">
				<input
					type="text"
					placeholder="Filter data..."
					value={filterText}
					onChange={(e) => setFilterText(e.target.value)}
					className="aag-data-table__filter-input"
				/>
				<table className="aag-data-table">
					<thead>
						<tr>
							{headers.map((header) => (
								<th key={header} onClick={() => requestSort(header)} className="aag-data-table__header">
									{header}
									{/* Show sort indicator icons */}
									{sortConfig.key === header && (
										<span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filteredData.map((row, index) => (
							<tr key={index}>
								{headers.map((header) => (
									<td key={header}>{row[header]}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
