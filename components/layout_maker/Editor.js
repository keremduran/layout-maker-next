import { useContext, useEffect, useRef, useState } from 'react';
import { tableDataContext } from '../App';
import Table from './Table';
import { deepCopy, kebabToCamel } from '../../util';

const defaultImportHTML = `<table cellSpacing="0" style="width: 100%;">
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 0px solid black;border-top: 0px solid black;font-size: 48px;all: 0px solid black;" colSpan="8"align="left">INVOICE</td>
  <td style="border: 0px solid black;" align="right"colSpan="7">[image]</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" colSpan="3"align="left">INVOICE NUMBER</td>
  <td style="border: 0px solid black;" colSpan="3"align="left">DATE OF ISSUE</td>
  <td style="border: 0px solid black;" align="left"colSpan="9"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" colSpan="3"align="left">[no]</td>
  <td style="border: 0px solid black;" colSpan="3"align="left">[date]<div><br></div></td>
  <td style="border: 0px solid black;" align="left"colSpan="9"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" align="left"colSpan="8"><br></td>
  <td style="border: 0px solid black;" colSpan="4"align="left"><b><div>Your company name</div></b></td>
  <td style="border: 0px solid black;" align="left"colSpan="3"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" colSpan="3"align="left"><div>BILLED TO</div><div>Client Name</div><div>Street address</div><div>City, State, Country</div><div>ZIP Code</div></td>
  <td style="border: 0px solid black;" align="left"colSpan="5"><br></td>
  <td style="border: 0px solid black;" colSpan="4"align="left"><div>123 Your Street</div><div>123 Your Street</div><div>[number]</div><div>[email]</div><div>[website]</div></td>
  <td style="border: 0px solid black;" align="left"colSpan="3"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" align="left"colSpan="15"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" align="left"colSpan="15"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 2px solid black;border-top: 0px solid black;all: 0px solid black;padding-bottom: 4px;" colSpan="8"align="left"><div>DESCRIPTION&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</div></td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 2px solid black;border-top: 0px solid black;all: 0px solid black;padding-bottom: 4px;" colSpan="2"align="left"><div>UNIT COST</div></td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 2px solid black;border-top: 0px solid black;all: 0px solid black;padding-bottom: 4px;" colSpan="3"align="left"><div>QTY/HR RATE</div></td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 2px solid black;border-top: 0px solid black;all: 0px solid black;padding-bottom: 8px;padding-top: 7px;" colSpan="2"align="left"><div>AMOUNT</div></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="8"align="left">Your item name</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="2"align="left">$0</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;" colSpan="3"align="left">1</td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 1px solid black;border-top: 0px solid black;all: 0px solid black;padding-top: 7px;padding-bottom: 8px;" colSpan="2"align="left">0</td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" colSpan="8"align="left"valign="top"><div>INVOICE TOTAL</div><div>$2,000</div></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border: 0px solid black;" align="left"><br></td>
  <td style="border-right: 0px solid black;border-left: 0px solid black;border-bottom: 0px solid black;border-top: 0px solid black;all: 0px solid black;padding-right: 17px;" colSpan="2"align="right"><b><div>SUBTOTAL</div><div>DISCOUNT</div><div>(TAX RATE)</div><div>TAX</div><div>TOAL</div></b></td>
  <td style="border: 0px solid black;" colSpan="2"align="left"><div>0</div><div>0</div><div>0</div><div>0</div><div>0</div></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" align="left"colSpan="15"><br><div><br></div></td>
</tr>
<tr style="font-size: 12px;">
  <td style="border: 0px solid black;" colSpan="15"align="left">TERMS<div>E.G Please pay invoice by MM/DD/YYYY</div></td>
</tr>
</table>`;

function cleanTableData(tableData) {
  const directionalStyles = ['padding', 'border'];
  const directions = ['Top', 'Right', 'Bottom', 'Left'];

  // Define a function to check if an object has a single repeated value for all its keys
  const hasRepeatedValues = (obj) => {
    const values = Object.values(obj);
    return values.every((val) => val === values[0]);
  };

  // Iterate over the rows in the tableData object
  for (let row of tableData.rows) {
    // Iterate over the cells in each row
    for (let cell of row.cells) {
      // Check if the styles object has a single repeated value
      directionalStyles.forEach((directionalStyle) => {
        const directionalStyleKeys = Object.keys(cell.styles).find(
          (key) =>
            key.includes(directionalStyle) &&
            directions.includes(directionalStyle.replace(directionalStyle, ''))
        );

        if (
          !directionalStyleKeys ||
          (directionalStyleKeys && directionalStyleKeys.length !== 4)
        )
          return;
        let previous;
        let clean = false;
        directionalStyleKeys.every((key, index) => {
          const directionalStyleValue = cell.styles[key];
          if (previous !== directionalStyleValue) {
            clean = true;
            return false;
          }
          previous = directionalStyleValue;
        });
        if (!clean) {
          const key = directionalStyleKeys[0];
          cell.styles[directionalStyle] = cell.styles[key];
          directionalStyleKeys.forEach((key) => {
            delete cell.styles[key];
          });
        }
      });

      if (hasRepeatedValues(cell.styles)) {
        // If it does, replace all the styles with a single style
        const styleValue = cell.styles[Object.keys(cell.styles)[0]];
        cell.styles = {
          border: styleValue,
        };
      }
    }
  }
  return tableData;
}

async function copyAdvancedPDFTable(e, oldTableData) {
  let tableData = deepCopy(oldTableData);
  tableData = cleanTableData(tableData);
  // Define a function to convert a string from camel case to kebab case
  const { cellSpacing } = tableData.attributes;

  const camelToKebab = (str) =>
    str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());

  // Convert the table styles to kebab case
  let tableStyles = '';
  for (let style of Object.keys(tableData.styles)) {
    const kebabStyle = camelToKebab(style);
    if (kebabStyle === 'inner-borders') continue;
    tableStyles += ` ${camelToKebab(style)}: ${tableData.styles[style]}; `;
  }

  let table = `<table cellSpacing="${cellSpacing}" style="${tableStyles}">
`;

  // Iterate over the rows in the tableData object
  for (let row of tableData.rows) {
    // Convert the row styles to kebab case
    let rowStyles = '';
    for (let style of Object.keys(row.styles)) {
      rowStyles += `${camelToKebab(style)}: ${row.styles[style]}; `;
    }

    table += `  <tr style="${rowStyles}">
`;
    // Iterate over the cells in each row
    for (let cell of row.cells) {
      // Convert the cell styles to kebab case
      let styles = '';
      for (let style of Object.keys(cell.styles)) {
        if (style && cell.styles[style].length > 0)
          styles += `${camelToKebab(style)}: ${cell.styles[style]}; `;
      }
      // Create a string of attributes for the cell
      let attributes = '';
      for (let attribute of Object.keys(cell.attributes)) {
        attributes += `${attribute}="${cell.attributes[attribute]}" `;
      }
      attributes = attributes.toLowerCase();
      const html = cell.children[0].html;
      // Add the cell to the table
      let style = '';
      if (styles.length > 0) style = `style="${styles}"`;

      table += `    <td ${style} ${attributes}>${html}</td>
`;
    }
    table += `  </tr>
`;
  }

  table += `</table>`;
  await navigator.clipboard.writeText(table);
  alert('copied to clipboard!');
  return table;
}

function tableToJson(tableData) {
  // Initialize empty object to store table data
  const table = {
    rows: [],
    styles: { width: '100%' },
    selectedCells: [],
    events: [],
    attributes: { cellSpacing: 0 },
  };

  // Split the table data string into an array of rows
  const rowsData = tableData.match(/<tr[\s\S]*?<\/tr>/g);

  // Loop through each row in the array
  for (let rowIndex = 0; rowIndex < rowsData.length; rowIndex++) {
    // Initialize empty array to store cells
    const cells = [];

    const row = {
      cells,
      styles: {},
      attributes: {},
    };

    // Split the current row into an array of cells
    const cellsData = rowsData[rowIndex].match(/<td[\s\S]*?<\/td>/g);
    const rowStylesData = rowsData[rowIndex].match(/style="[^"]*"/g);
    const rowAttributesData = rowsData[rowIndex].match(/<tr[^>]*>/g);

    if (rowStylesData) {
      const styles = rowStylesData[0]
        .replace('style=', '')
        .replace(/"/g, '')
        .split(';');

      for (let style of styles) {
        let [property, value] = style.split(':');
        if (property && value) {
          property = kebabToCamel(property.trim());
          row.styles[property] = value.trim();
        }
      }
    }

    if (rowAttributesData) {
      const attributes = rowAttributesData[0]
        .replace('<tr', '')
        .replace('>', '')
        .split(' ');

      for (let attribute of attributes) {
        const [property, value] = attribute.split('=');

        if (property && value && property !== 'style') {
          const processedValue = value.replace(/^\s+|\s+$/g, '');
          row.attributes[property.trim()] = processedValue;
        }
      }
    }

    // Loop through each cell in the array
    for (let cellIndex = 0; cellIndex < cellsData.length; cellIndex++) {
      // Initialize empty object to store cell data
      const cell = {
        children: [],
        styles: {},
        attributes: {
          colSpan: 1,
          rowSpan: 1,
        },
        location: {
          rowIndex,
          cellIndex,
        },
      };

      // Get the child elements of the cell
      function extractTdHtml(string) {
        const regex = /<td[^>]*>(.+)<\/td>/;
        const match = regex.exec(string);
        if (match) {
          return match[1];
        }
        return null;
      }

      function extractTdText(string) {
        if (string) return string.replace(/<[^>]+>/g, '');
        return '';
      }

      const tdHTML = extractTdHtml(cellsData[cellIndex]);
      const tdText = extractTdText(tdHTML);
      cell.children.push({
        html: tdHTML,
        text: tdText,
      });
      const stylesData = cellsData[cellIndex].match(/style="[^"]*"/g);
      if (stylesData) {
        const styles = stylesData[0]
          .replace('style=', '')
          .replace(/"/g, '')
          .split(';');
        for (let style of styles) {
          let [property, value] = style.split(':');
          if (property && value) {
            property = kebabToCamel(property.trim());
            cell.styles[property] = value.trim();
          }
        }
      }

      // Get the attributes of the cell element
      const attributesData = cellsData[cellIndex].match(/<td[^>]*>/g);
      if (attributesData) {
        const attributeRegex =
          /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
        const attributes = attributesData[0]
          .replace('<td', '')
          .replace('>', '');
        const attributeList = attributes.match(attributeRegex);
        for (let attribute of attributeList) {
          let [property, value] = attribute.split('=');

          if (property && value && property !== 'style' && value.length > 0) {
            const processedValue = value.replace(/^"|"$/g, '');
            property = property.trim();
            if (property === 'colspan') property = 'colSpan';
            else if (property === 'rowspan') property = 'rowSpan';
            cell.attributes[property] = processedValue;
          }
        }
      }

      cells.push(cell);
    }
    table.rows.push(row);
  }
  return table;
}

export const Editor = () => {
  let { tableData, setTableData } = useContext(tableDataContext);
  const [editTextMode, setEditTextMode] = useState(true);
  const [history, setHistory] = useState([deepCopy(tableData)]);
  const [version, setVersion] = useState(0);
  const [importHTML, setImportHTML] = useState(defaultImportHTML);
  const [showImportTextArea, setShowImportTextArea] = useState(false);
  const selectedCellsRef = useRef(null);

  function handleClickOutside(event, ref = selectedCellsRef) {
    if (ref.current && !ref.current.contains(event.target)) {
      tableData['selectedCells'] = [];
      setTableData({ ...tableData });
    }
  }

  const handleToggleEditTextMode = () => {
    const events = tableData['events'];

    setEditTextMode((editTextMode) => !editTextMode);

    events['editTextMode'] = editTextMode;

    setTableData({ ...tableData });
  };

  const handleKeyUp = (e) => {
    if (e.which === 17) handleToggleEditTextMode();
  };

  const handleSave = (historyTableData = tableData) => {
    if (history.length === 30) {
      alert('Too many saves!');
      return;
    }
    history.push(deepCopy(historyTableData));
    setHistory(history);
    handleSetVersion(history.length - 1);
  };

  const handleSetVersion = (versionNo) => {
    if (versionNo < 0 || versionNo >= history.length) return;

    setVersion(versionNo);
    tableData = history[versionNo];

    setTableData({ ...tableData });
  };

  const handleImportHTML = () => {
    let importedTableData;

    try {
      importedTableData = tableToJson(importHTML);
    } catch (error) {
      console.error(error);
      alert('Bad import.');
    }

    handleSave(importedTableData);
    setShowImportTextArea(false);
  };

  return (
    <div
      tabIndex='0'
      onKeyUpCapture={handleKeyUp}
      onClick={handleClickOutside}
      style={{ padding: '2rem', paddingTop: '1rem' }}
    >
      <h1>Table Layout Generator</h1>

      <div className='editor-controls'>
        <button
          className='button-primary'
          onClick={(e) => copyAdvancedPDFTable(e, tableData)}
        >
          Copy Layout
        </button>
        <button className='button-primary' onClick={handleToggleEditTextMode}>
          Edit Text mode {!editTextMode && ` ✓`}
        </button>
        <span className='import-layout'>
          {showImportTextArea && (
            <span className='import-layout-elements'>
              <button
                className='button-primary'
                disabled={importHTML.length <= 0 || importHTML.length > 40000}
                onClick={handleImportHTML}
              >
                Send {`(${importHTML.length}/40000)`}
              </button>
              <textarea
                value={importHTML}
                onChange={(e) => {
                  setImportHTML(e.target.value);
                }}
              />
            </span>
          )}

          <button
            className='button-primary'
            onClick={() =>
              setShowImportTextArea((showImportTextArea) => !showImportTextArea)
            }
          >
            Import
          </button>
        </span>
        <span className='version-control'>
          <span className='version-control-buttons'>
            <button onClick={() => handleSetVersion(version - 1)}>L</button>
            <span>
              {version + 1}/{history.length}
            </span>
            <button onClick={() => handleSetVersion(version + 1)}>R</button>
          </span>
          <button className='button-primary' onClick={() => handleSave()}>
            Save
          </button>
        </span>
      </div>
      <div className='letter'>
        <span ref={selectedCellsRef}>
          <Table props={{ tableData }} />
        </span>
      </div>
    </div>
  );
};
