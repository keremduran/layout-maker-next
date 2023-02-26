import React, { useContext } from 'react';
import { deepCopy } from '../../../util';
import { tableDataContext } from '../../App';

type Props = any;

const AddRemove = (props: Props) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const handleCopyRow = () => {
    const row = tableData.rows[location.i];
    const copiedRow = deepCopy(row);
    tableData.rows.splice(location.i, 0, copiedRow);
    tableData.selectedCells = [];
    setTableData({ ...tableData });
  };

  const handleDeleteRow = () => {
    tableData.selectedCells = [];
    tableData.rows.splice(location.i, 1);
    setTableData({ ...tableData });
  };

  const handleCopyCol = () => {
    tableData.rows.forEach((row) => {
      const cell = row.cells[location.j];
      const copiedCell = deepCopy(cell);
      row.cells.splice(location.j, 0, copiedCell);
    });
    setTableData({ ...tableData });
  };
  const handleDeleteCol = () => {
    tableData.rows.forEach((row) => {
      row.cells.splice(location.j, 1);
    });
    setTableData({ ...tableData });
  };

  const rowStuff = {
    addRemove: [
      { type: 'button', label: 'CopyBelow', action: handleCopyRow },
      { type: 'button', label: 'DeleteRow', action: handleDeleteRow },
    ],
  };

  const columnStuff = {
    addRemove: [
      { type: 'button', label: 'CopyRight', action: handleCopyCol },
      { type: 'button', label: 'DeleteCol', action: handleDeleteCol },
    ],
  };
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1rem)',
        gridTemplateRows: 'repeat(3, 1rem)',
        gap: '0.1rem',
        gridTemplateAreas: `
        ". DeleteRow ."
        "DeleteCol . CopyRight"
        ". CopyBelow ."`,
      }}
    >
      {columnStuff.addRemove.map(({ action, label }, index) => (
        <button
          style={{ gridArea: label }}
          key={label + index}
          onClick={action}
        >
          {label.includes('Copy') ? '+' : '-'}
        </button>
      ))}
      {rowStuff.addRemove.map(({ action, label }, index) => (
        <button
          style={{ gridArea: label }}
          key={label + index}
          onClick={action}
        >
          {label.includes('Copy') ? '+' : '-'}
        </button>
      ))}
    </div>
  );
};

export default AddRemove;
