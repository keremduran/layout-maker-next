import {
  BsPencil,
  BsLightbulb,
  BsShuffle,
  BsPlus,
  BsFillPlayFill,
} from 'react-icons/bs';

import React, { useContext, useState } from 'react';
import { TreeContext } from '../../contexts/treeContext';
import { getSplitTasksPrompt, splitTextToSubTasks } from '../../prompts';
import { fetchProps, getBranchById } from '../../pages/openai';

// Tree root state is being prop drilled for now as the 'state' prop, later I will use context for this.
const BranchMenuButtons = ({
  setEditMode,
  parentRef,
  id,
  setBranchState,
  branchState,
  loading,
  setLoading,
  branchMode,
  fixes,
}) => {
  // Get the context object containing the root state
  const context = useContext(TreeContext);
  const { fetchOpenAIData, rootState } = context;
  const { prefix, postfix } = fixes[branchMode];
  const openaiProps = fetchProps['createCompletion'];
  const requestParams = openaiProps.body.requestParams;

  const splitTasks = () => {
    if (branchState.task.length <= 2) return;

    let { prefix, postfix } = getSplitTasksPrompt(rootState);
    const prompt = prefix + branchState.task + postfix;

    const setter = (res) => {
      const joinedSubTasks = res.choices[0].text;
      if (!joinedSubTasks) return;

      const subTasks = splitTextToSubTasks(joinedSubTasks, id);

      const nodeState = getBranchById(rootState.subTasks, id);
      nodeState.subTasks = subTasks;
      setBranchState({ ...nodeState });
    };

    makeRequest(prompt, setter);
  };

  const openaiTip = () => {
    const fullList = JSON.stringify(rootState);
    const prompt = `This is the task list: '${fullList}', 
        Make elaboration for this task: '${branchState.task}'.
        Give me one extra paragraph about how to accomplish the task using openai.
        Use a commanding tone.`;

    const setter = (res) => {
      const elaboration = res.choices[0].text;
      if (!elaboration) return;
      alert(elaboration);
    };

    makeRequest(prompt, setter);
  };

  const elaborate = () => {
    const fullList = JSON.stringify(rootState);
    const prompt = `This is the task list: '${fullList}', 
        Make elaboration for this task: '${JSON.stringify(branchState)}'.`;

    const setter = (res) => {
      const elaboration = res.choices[0].text;
      if (!elaboration) return;
      console.log('tasks', branchState, 'elaboration', elaboration);
      branchState.task += elaboration;
      console.log('task after elaboration', branchState.task);

      setBranchState({ ...branchState });

      parentRef.task = branchState.task;
      state.setTasks({ ...state.tasks });
    };

    makeRequest(prompt, setter);
  };

  const executeTask = () => {
    const mainPrompt =
      branchMode === 'standalone'
        ? branchState.task
        : JSON.stringify(branchState);
    const prompt = `${prefix}${mainPrompt}${postfix}`;

    const setter = (res) => {
      const execution = res.choices[0].text;
      if (!execution) return;

      console.log('branchState', branchState, 'execution', execution);
      branchState.task += execution;
      console.log('executed Task state', branchState.task);

      setBranchState({ ...branchState });

      parentRef.task = branchState.task;
      state.setTasks({ ...state.tasks });
    };

    makeRequest(prompt, setter);
  };

  const makeRequest = (prompt, setter) => {
    requestParams.prompt = prompt;
    fetchOpenAIData({
      prompt,
      setter,
      type: 'createCompletion',
      setLoading,
    });
  };

  const toggleEditTask = () => {
    setEditMode((editMode) => !editMode);
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button onClick={splitTasks}>
            <BsShuffle />
          </button>
          <button onClick={elaborate}>
            <BsPlus />
          </button>
          <button onClick={openaiTip}>
            <BsLightbulb />
          </button>
          <button onClick={toggleEditTask}>
            <BsPencil />
          </button>
          <button onClick={executeTask}>
            <BsFillPlayFill />
          </button>
        </div>
      )}
    </div>
  );
};

export default BranchMenuButtons;
