import React from 'react';

const EditFixes = () => {
  return (
    <div
      className='edit-area'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }}
    >
      {showEditFixes && (
        <>
          <label htmlFor='editPrefix'>Prefix:</label>
          <textarea
            value={fixes[branchMode].prefix}
            style={{ width: '100%', height: '3rem' }}
            onChange={handleEditPrefix}
          />
        </>
      )}
      <label htmlFor='editMainPrompt'>Main Prompt:</label>
      <textarea
        name='editMainPrompt'
        value={branchState.task}
        style={{ width: '100%', height: '3rem' }}
        onChange={handleEditTask}
      />
      {showEditFixes && (
        <>
          <label htmlFor='editPostfix'>Postfix:</label>
          <textarea
            value={fixes.postfix}
            style={{ width: '100%', height: '3rem' }}
            onChange={handleEditPosfix}
            name='editPostFix'
          />
        </>
      )}
    </div>
  );
};

export default EditFixes;
