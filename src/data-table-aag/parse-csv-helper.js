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
