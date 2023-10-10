describe("parse_pdf", () => {
  it("should parse a PDF file and return regions, counties, areas, and locations", async () => {
    const pdf_file = "test.pdf";
    const result = await parsePDF(pdf_file);

    expect(result).toEqual([
      {
        "NAIROBI REGION ":
          '{"counties":[{"Nairobi County":{"areas":[{"area":"Area 1","date":"2022/01/01","startTime":"08:00","endTime":"17:00","locations":"Location 1, Location 2"},{"area":"Area 2","date":"2022/01/02","startTime":"08:00","endTime":"17:00","locations":"Location 3, Location 4"}]}}]}',
      },
      {
        "COAST REGION ":
          '{"counties":[{"Mombasa County":{"areas":[{"area":"Area 1","date":"2022/01/03","startTime":"08:00","endTime":"17:00","locations":"Location 5, Location 6"},{"area":"Area 2","date":"2022/01/04","startTime":"08:00","endTime":"17:00","locations":"Location 7, Location 8"}]}},{"Kwale County":{"areas":[{"area":"Area 1","date":"2022/01/05","startTime":"08:00","endTime":"17:00","locations":"Location 9, Location 10"},{"area":"Area 2","date":"2022/01/06","startTime":"08:00","endTime":"17:00","locations":"Location 11, Location 12"}]}}]}',
      },
    ]);
  });

  it("should handle PDF files with missing or incomplete data", async () => {
    const pdf_file = "test_missing_data.pdf";
    const result = await parsePDF(pdf_file);

    expect(result).toEqual([
      {
        "NAIROBI REGION ":
          '{"counties":[{"Nairobi County":{"areas":[{"area":"Area 1","date":"2022/01/01","startTime":"08:00","endTime":"17:00","locations":"Location 1, Location 2"},{"area":"Area 2","date":"2022/01/02","startTime":"08:00","endTime":"","locations":"Location 3, Location 4"}]}}]}',
      },
      {
        "COAST REGION ":
          '{"counties":[{"Mombasa County":{"areas":[{"area":"Area 1","date":"2022/01/03","startTime":"08:00","endTime":"17:00","locations":"Location 5, Location 6"},{"area":"Area 2","date":"","startTime":"","endTime":"","locations":"Location 7, Location 8"}]}},{"Kwale County":{"areas":[]}}]}',
      },
    ]);
  });

  it("should handle PDF files with no data", async () => {
    const pdf_file = "test_no_data.pdf";
    const result = await parsePDF(pdf_file);

    expect(result).toEqual([]);
  });
});
