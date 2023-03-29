import React, { useEffect, useState } from "react";
import './App.scss';

function App() {

  const [arg, setArg] = useState({argOption: [{ label: 'My Arg', value: "false"}]})

  const defaultOption = [
    { label: "select...", value: ""},
    { label: "constant", value: false },
    { label: "argument", value: arg.argOption[0].label },
    { label: "and", value: "and" },
    { label: "or", value: "or" }
  ];

  const logicalOption = [
    { label: "and", value: "and" },
    { label: "or", value: "or" }
  ]

  const constantOption = [
    { label: 'true', value: true},
    { label: 'false', value: false},
  ]


  const [id,setId] = useState(0);
  const [result, setResult] = useState(undefined);

  const [selectedOptions, setSelectedOptions] = useState([{selectId: id, value: "", active: true, selectFields: [] }]);

  
  function updateSelectFieldsSpecial(arr, id, selectedValue, newSelectField) {
    return arr.map(obj => {
      if (obj.selectId === id) {
        return {...obj, value: selectedValue, active: false, selectFields: newSelectField }; 
      } else if (obj.selectFields.length > 0) {
        return { ...obj, selectFields: updateSelectFieldsSpecial(obj.selectFields, id, selectedValue, newSelectField) };
      } else {
        return obj;
      }
    });
  }
  
  function addNewSelectField(arr, parentId, newObj) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].selectId === parentId) {
        arr[i].selectFields.push(newObj); 
        return arr; 
      } else if (arr[i].selectFields.length > 0) {
        const nestedFieldAdded = addNewSelectField(arr[i].selectFields, parentId, newObj);
        if (nestedFieldAdded) {
          return arr; 
        }
      }
    }
    return false; 
  }
  
  function updateSelectFields(arr, id, newValue) {
    return arr.map(obj => {
      if (obj.selectId === id) {
        return { ...obj, value: newValue, active: false };
      } else if (obj.selectFields.length > 0) {
        return { ...obj, selectFields: updateSelectFields(obj.selectFields, id, newValue) }; 
      } else {
        return obj;
      }
    });
  }

  function getValueById(arr, id) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].selectId === id) {
        return arr[i].active;
      } else if (arr[i].selectFields.length > 0) {
        const nestedValue = getValueById(arr[i].selectFields, id); 
        if (nestedValue !== null) {
          return nestedValue;
        }
      }
    }
    return null; 
  }
  
  function deleteSelectFieldById(arr, selectId) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].selectId === selectId) {
        arr[i].value="";
        arr[i].active = true;
        arr[i].selectFields = [];
        return arr; 
      } else if (arr[i].selectFields.length > 0) {
        const nestedFieldUpdated = deleteSelectFieldById(arr[i].selectFields, selectId); 
        if (nestedFieldUpdated) {
          return arr;
        }
      }
    }
    return false; 
  } 

  const handleSelectChange = (selectId, event) => {
    const  selectedValue= event.target.value;

    const activeValue = getValueById(selectedOptions, selectId);

    if ((selectedValue === "and" || selectedValue === "or") && activeValue) {
      var updatedField = updateSelectFieldsSpecial(selectedOptions, selectId, selectedValue, [{selectId: id+1, value: "", active: true, selectFields: [] }, {selectId: id+2, value: "", active: true, selectFields: [] }]);
      setId(id+2)
    }else{
      updatedField = updateSelectFields(selectedOptions, selectId, selectedValue);
    }

    setSelectedOptions(updatedField);

  };

  const handleAddSelect = (selectId) => {
    const newObj = { selectId: id+1, value: "", active: true, selectFields: [] };
    let updatedField = addNewSelectField(selectedOptions, selectId, newObj);

    setId(id+1)
    setSelectedOptions(updatedField);
  }; 

  const handleDeselect = (selectId) => {
    const dubSelectedOption = [...selectedOptions]
    let updatedField = deleteSelectFieldById(dubSelectedOption, selectId);
    setSelectedOptions(updatedField);
  }


  function performLogicalOperation(array) {
    let result;
    array.forEach((obj) => {
      if (obj.active) {
        
        result = null
        
      }else {
        if (obj.value === "and") {

          let and = [];

          obj.selectFields.forEach((innerObj)=> {
            const value = performLogicalOperation([innerObj]);
            and.push(value)
          })

          var countNull = 0;
          var countBoolean = 0;

          const allTrue = and.every((val) => {
            if(val != null){
              countBoolean += 1;
              return val === true ;
            }else{
              countNull += 1;
              return val === null
            }
          });

          if(countBoolean === 0 && countNull > 0){
            result = null
          }else if(allTrue){
            result = true
          }else{
            result = false
          }

        } else if (obj.value === "or") {

          let or = [];

          obj.selectFields.forEach((innerObj)=> {
            const value = performLogicalOperation([innerObj]);
            or.push(value)
          })

          countNull = 0;
          countBoolean = 0;

          const allFalse = or.every((val) => {
            if(val != null){
              countBoolean += 1;
              return val === false ;
            }else{
              countNull += 1;
              return val === null
            }
          });

          if(countBoolean === 0 && countNull > 0){
            result = null
          }else if(allFalse){
            result = false
          }else{
            result = true
          }


        } else if (arg.argOption.some(option => option.label === obj.value)) {
          const data = arg.argOption.find(option => option.label === obj.value);

          if(data.value === "true"){
            result = true;
          }else{
            result = false;
          }

        } else{
          if(obj.value === "true"){
            result = true;
          }else{
            result = false;
          }
        }

      }
    });
    return result;
  }

  useEffect(() => {
    const data = performLogicalOperation(selectedOptions);
    
    if(data === true){
      setResult("true")
    }else if(data === false){
      setResult("false")
    }else{
      setResult(data)
    }
  }, [selectedOptions, performLogicalOperation])
  
  const changeArgOption = (e, index) => {
    const newArg = [...arg.argOption]
    const newObj = {label: e.target.value, value: arg.argOption[index].value}
    newArg[index] = newObj
    setArg({argOption: newArg})
  }
  
  const handleArgValue = (index, e) => {
    var newValue = e.target.value;
    var updatingArg = {...arg}
    updatingArg.argOption[index].value = newValue;
    setArg(updatingArg)
  }

  const handleAddArg = () => {
    let newArgOption = {label: 'newarg', value: false}
    let oldArg = [...arg.argOption, newArgOption]
    setArg({argOption: oldArg})
  }
    
  return (
    <div className="app">
      <div className="app__main">

        <div className="app__main__arguments">
          {
            arg.argOption.map(({label, value}, index)=> (
              <div key={index} className="app__main__arguments__arg">
                <input className="app__main__arguments__arg__input" type="text" value={label} onChange={(e)=> changeArgOption(e,index)} />
                <select value={value} onChange={(e)=> handleArgValue(index, e)}>
                  {
                    constantOption.map(({label, value}) => (
                      <option key={label} value={value}>
                        {label}
                      </option>
                    ))
                  }
                </select>
              </div>
            ))
          }
          
          <button className="app__main__arguments__addArgBtn" onClick={handleAddArg}>+ add arg</button>
        </div>
        
        {
        selectedOptions.map((selectedOption, index) => (
          <div className="app__main__selectField" key={index}>
            <div className="app__main__selectField__block">
              <select
                value={selectedOption.value}
                onChange={(event) => handleSelectChange(selectedOption.selectId, event)}
              >
              {
                selectedOption.active ? defaultOption.map(({ label, value }) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                )) : selectedOption.value === "and" || selectedOption.value === "or" ? logicalOption.map(({ label, value }) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))              
                : arg.argOption.some(option => option.label === selectedOption.value) ? arg.argOption.map(({ label }) => (
                  <option key={label} value={label}>
                    {label}
                  </option> )) : constantOption.map(({ label, value }) => (
                <option key={label} value={value}>
                  {label}
                </option>))
              }
              </select>
              <button className="app__main__selectField__block__delBtn" onClick={() => handleDeselect(selectedOption.selectId)}>x</button>
            </div>

            

            {
              selectedOption.selectFields.length !== 0 && selectedOption.selectFields.map((selectFieldOption, indexParam)=>(
                  <SelectBox key={indexParam} defaultOption={defaultOption} constantOption={constantOption} arg={arg} logicalOption={logicalOption} handleAddSelect={handleAddSelect} selectFieldOption={selectFieldOption} handleSelectChange={handleSelectChange} handleDeselect={handleDeselect}/>
              ))
            }
            
            {
              selectedOption.value === "and" || selectedOption.value === "or" ? <button className="addBtn" onClick={() => handleAddSelect(selectedOption.selectId)}>+ add op</button> : null
            }
          </div>
        ))}

        <div className="app__main__result">result: {result ? result : "undefined"}</div>
      </div>
    </div>
  );
}

export default App;


export function SelectBox ({defaultOption, constantOption, arg, logicalOption, handleAddSelect, selectFieldOption, handleSelectChange, handleDeselect}) {

  return(
    <div className="selectBox">
      <div className="selectBox__selectField">
        <div className="selectBox__selectField__block">
          <select
            value={selectFieldOption.value}
            onChange={(event) => handleSelectChange(selectFieldOption.selectId, event)}
          >
          {
            selectFieldOption.active ? defaultOption.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            )) : selectFieldOption.value === "and" || selectFieldOption.value === "or" ? logicalOption.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))              
            : arg.argOption.some(option => option.label === selectFieldOption.value) ? arg.argOption.map(({ label, value }) => (
              <option key={label} value={label}>
                {label}
              </option> )) : constantOption.map(({ label, value }) => (
            <option key={label} value={value}>
              {label}
            </option>))
          }
          </select>  
          <button className="selectBox__selectField__block__delBtn" onClick={() => handleDeselect(selectFieldOption.selectId)}>x</button>
        </div>
        {

          selectFieldOption.selectFields.length !== 0 && selectFieldOption.selectFields.map((selectFieldOption, index)=>(
            <SelectBox key={index} defaultOption={defaultOption} constantOption={constantOption} arg={arg} logicalOption={logicalOption} handleAddSelect={handleAddSelect} selectFieldOption={selectFieldOption} handleSelectChange={handleSelectChange} handleDeselect={handleDeselect}/>
            ))
        }
        
        {
          selectFieldOption.value === "and" || selectFieldOption.value === "or" ? <button className="addBtn" onClick={() => handleAddSelect(selectFieldOption.selectId)}>+ add op</button> : null
        }
      </div>
    </div>
  )
}


