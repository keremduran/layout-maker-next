import React from 'react';
import { Cell } from './Cell';
import { Row } from './Row';

const Table = ({ props }) => {
  const { tableData } = props;
  const table = [];

  tableData.rows.forEach((rowData, i) => {
    const row = [];

    rowData.cells.forEach((cell, j) => {
      cell.location = { i, j };
      row.push(<Cell key={`${i},${j}`} props={cell} />);
    });

    table.push(
      <Row key={`${i}`} row={tableData.rows[i]}>
        {row}
      </Row>
    );
  });
  return (
    <table
      cellSpacing={
        tableData.attributes.cellSpacing ? tableData.attributes.cellSpacing : 0
      }
      style={{ ...tableData.styles }}
    >
      <tbody>{table}</tbody>
    </table>
  );
};

export default Table;
