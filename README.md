# Portfolio PDF Extractor

A CLI tool to automatically extract structured project data (titles, categories, images) from a designer's portfolio PDF and output normalized JSON.

## Features

- **Text Extraction**: Detects project titles and categories using heuristics (font size, all-caps, common keywords).
- **Image Extraction**: Extracts embedded images from the PDF.
- **Project Mapping**: Groups pages and images into distinct projects.
- **Asset Organization**: Saves extracted images into per-project folders.
- **JSON Output**: Generates a clean `works.json` file ready for use in portfolio websites or CMS.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/testing-archit/pdf-portfolio-extractor.git
   cd pdf-portfolio-extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the tool by providing the path to your portfolio PDF:

```bash
node index.js ./path/to/portfolio.pdf
```

### Mock Data
To test the tool without your own PDF, generate a mock PDF:

```bash
node create-mock-pdf.js
node index.js input/mock.pdf
```

## Output Structure

The tool generates an `output` folder and an `assets` folder:

```
output/
└── works.json       # Structured data

assets/
├── project-slug-1/  # Images for project 1
└── project-slug-2/  # Images for project 2
```

### JSON Schema

```json
[
  {
    "id": "smart-chef",
    "title": "Smart Chef",
    "category": "App Design",
    "tags": [],
    "description": "",
    "images": [
      "assets/smart-chef/image1.jpg",
      "assets/smart-chef/image2.jpg"
    ],
    "sourcePage": 3
  }
]
```

## Config & Customization

- **Heuristics**: Modify `map-projects.js` to adjust title detection thresholds (e.g., font height) or add new category keywords.
- **Image Support**: Currently supports JPEG extraction.

## License

ISC
