import React, { useContext } from 'react';
import { tableDataContext } from '../../App';

type Props = {};

const MergeCells = (props: Props) => {
  let { tableData, setTableData } = useContext(tableDataContext);
  //   if (!tableData.selectedCells) return <button disabled={true}>Merge</button>;

  const selectedCells = tableData.selectedCells
    ?.sort((a, b) => a.replace('-', '') - b.replace('-', ''))
    .map((selectedCell) => {
      const i = Number(selectedCell.split('-')[0]);
      const j = Number(selectedCell.split('-')[1]);

      return tableData?.rows[i]?.cells[j];
    });
  // Group selected cells to rows (they are already sorted)
  const getGroupedSelectedRows = () => {
    const selectedRows = {};

    selectedCells.forEach((cell) => {
      if (!cell) return;

      const { i, j } = cell.location;
      if (!selectedRows[i]) selectedRows[i] = [];
      selectedRows[i].push(cell);
    });

    return selectedRows;
  };
  const handleMergeCells = (e) => {
    const selectedRows = getGroupedSelectedRows();

    // Compute colspans and left-most cells for each row
    Object.keys(selectedRows).forEach((rowIndex) => {
      // Get the selected row and check if there's anything selected.
      const selectedRow = selectedRows[rowIndex];
      if (selectedRow.length === 0) return;

      // Assign left-most cell where all the cells to it's right will be merged into
      const leftMostCell = selectedRow[0];
      const { i: leftI, j: leftJ } = leftMostCell.location;

      // Initialize colSpan attribute to avoid errors.
      const leftMostAttributes = leftMostCell.attributes;
      if (!leftMostAttributes.colSpan) leftMostAttributes.colSpan = 1;

      // initialize rightMost cell
      const rightMostCell = selectedRow[selectedRow.length - 1];
      const { j: rightJ } = rightMostCell.location;

      // Loop through every cell to the right until the end of selection and gather the colspan values
      for (let index = leftJ; index < rightJ; index++) {
        const rightCell = tableData.rows[leftI].cells[index + 1];
        if (!rightCell) return;

        // Gather the colspan of the cell to the right
        let rightColSpan = rightCell.attributes.colSpan;
        if (!rightColSpan) rightColSpan = 1;

        // Add it to the leftMost cell's colspan
        leftMostAttributes.colSpan += rightColSpan;

        // Add the contents of the cell to the leftMost
        const { text: oldText, html: oldHtml } = leftMostCell.children[0];
        const { text, html } = rightCell.children[0];

        leftMostCell.children = [
          { text: oldText + text, html: oldHtml + html },
        ];
      }

      // Remove the selectedCells to the right
      const removeCount = rightJ - leftJ;
      tableData.rows[leftI].cells.splice(leftJ + 1, removeCount);

      // Assign the leftMostCell to the table
      tableData.rows[leftI].cells[leftJ] = leftMostCell;
    });

    tableData['selectedCells'] = [];
    setTableData({ ...tableData });
  };

  return (
    <button
      disabled={
        !(tableData.selectedCells && tableData.selectedCells.length > 0)
      }
      onClick={handleMergeCells}
    >
      Merge
    </button>
  );
};

export default MergeCells;
