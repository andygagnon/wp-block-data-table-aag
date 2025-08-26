// file: view.js
/**
 * This is the front-end script for the block, loaded on the public website.
 * It's responsible for fetching the data and rendering the dynamic table.
 * It uses the same React logic as the editor's `edit.js` file.
 */
const DATA_URL = typeof AAG_PLUGIN_DATA !== 'undefined' ? AAG_PLUGIN_DATA.csvUrl : '';

/**
 * The following imports are from the React and ReactDOM libraries.
 * We need to explicitly import them here for the front-end rendering.
 */
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Internal dependencies
 */
import './style.scss';
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

const DataTable = () => {
	// State for data, filter text, and sorting configuration, same as in edit.js.
	const [allData, setAllData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [filterText, setFilterText] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

	// Data fetching logic.
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(DATA_URL);
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const csvText = await response.text();
				const parsedData = parseCSV(csvText);

				if (Array.isArray(parsedData) && parsedData.length > 0) {
					setAllData(parsedData);
					setFilteredData(parsedData);
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
	}, []);

	// Filtering logic.
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

	// Sorting logic.
	const requestSort = (key) => {
		let direction = 'asc';
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });

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

	const headers = allData.length > 0 ? Object.keys(allData[0]) : [];

	if (allData.length === 0) {
		return <p>Loading data...</p>;
	}

	return (
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
	);
};

// Find all instances of our block on the page and render the React component into them.
document.addEventListener('DOMContentLoaded', () => {
	const blockWrappers = document.querySelectorAll('.wp-block-data-table-aag-dynamic-data-table');
	blockWrappers.forEach(wrapper => {
		const root = createRoot(wrapper);
		root.render(<DataTable />);
	});
});
