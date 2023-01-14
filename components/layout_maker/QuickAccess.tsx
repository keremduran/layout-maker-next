import React from 'react';
import SetBold from './edit/SetBold';
import Selection, { SelectCells } from './edit/Selection';
type Props = {};

const QuickAccess = (props: any) => {
  console.log(props);

  return (
    <div>
      <h3>Quick access</h3>
      <SetBold />
      <SelectCells location={props.location} />
    </div>
  );
};

export default QuickAccess;
