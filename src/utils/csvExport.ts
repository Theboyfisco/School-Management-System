/**
 * Utility to export an array of objects to a CSV file.
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data provided for CSV export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Build the CSV string
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          
          // Handle complex objects/arrays (convert to string)
          if (value !== null && typeof value === 'object') {
            value = JSON.stringify(value);
          }
          
          // Escape quotes and wrap in quotes
          const escaped = String(value ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
