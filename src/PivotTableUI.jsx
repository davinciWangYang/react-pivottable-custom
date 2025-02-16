import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort} from './Utilities';
import PivotTable from './PivotTable';
import Sortable from 'react-sortablejs';
import Draggable from 'react-draggable';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!


class BottomRenderer extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const Renderer = this.props.bottomRenderer;
    return  <div>{Renderer && (<Renderer />)}</div>;
  }
}
BottomRenderer.propTypes = Object.assign({}, PivotTable.propTypes, {
  bottomRenderer: PropTypes.func,
});


export class DraggableAttribute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false, filterText: '',valueFilter: []};

    this.wrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event) {
    if(this.wrapperRef.current){
     if (!this.wrapperRef.current.contains(event.target)) {
        this.setState({open:false});
      }
    }
    
  }
  
  toggleValue(value) {
    if (this.state.valueFilter.includes(value)) {
      this.setState({valueFilter:this.state.valueFilter.filter(y=> y !== value)});
    } else {
      this.setState({valueFilter:[...this.state.valueFilter,value]});
    }
  }
  addValuesToFilter(values){
    this.setState({valueFilter:values});
  }
  matchesFilter(x) {
    return x
      .toLowerCase()
      .trim()
      .includes(this.state.filterText.toLowerCase().trim());
  }

  selectOnly(e, value) {
    e.stopPropagation();
    this.props.setValuesInFilter(
      this.props.name,
      Object.keys(this.props.attrValues).filter(y => y !== value)
    );
  }

  getFilterBox() {
    const showMenu =
      Object.keys(this.props.attrValues).length < this.props.menuLimit;

    const values = Object.keys(this.props.attrValues);
    const shown = values
      .filter(this.matchesFilter.bind(this));
    const valueTitle = (this.props.name !== 'timeLevel'? this.props.name !== 'Time'?this.props.name:'Period' :  'Timescales') + 's (' + values.length + ')';


    return (
      <Draggable handle=".pvtDragHandle">
        <div
          className="pvtFilterBox"
          style={{
            display: 'block',
            cursor: 'initial',
            zIndex: this.props.zIndex,
          }}
          onClick={() => this.props.moveFilterBoxToTop(this.props.name)}
          ref={this.wrapperRef}
        >
          <a onClick={() => this.setState({open: false})} className="pvtCloseX">
            ×
          </a>
          <h4>{valueTitle}</h4>
          {showMenu || <p>(too many values to show)</p>}
          {showMenu && (
            <p>
              <TextField
                variant="standard"
                placeholder="Filter values"
                className="pvtSearch"
                value={this.state.filterText}
                onChange={e =>
                  this.setState({
                    filterText: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
              />
              <br />
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.addValuesToFilter(
                    []
                  )
                }
              >
                Select {values.length === shown.length ? 'All' : shown.length}
              </a>{' '}
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.addValuesToFilter(
                    Object.keys(this.props.attrValues).filter(
                      this.matchesFilter.bind(this)
                    )
                  )
                }
              >
                Deselect {values.length === shown.length ? 'All' : shown.length}
              </a>
            </p>
          )}
          {showMenu && (
            <div className="pvtCheckContainer">
              {shown.map(x => (
                <p key={x}>
                  <Checkbox
                    style={{
                      padding: '0px 9px',
                    }}
                    checked={this.state.valueFilter.includes(x) ? false : true}
                    onClick={() => this.toggleValue(x)}
                  />
                  {x === '' ? <em>null</em> : x}
                </p>
              ))}
            </div>
          
          )}
          {showMenu &&(
            <div className='pvtFooter'>
                <a role="button"
                    className="pvtButton"
                    onClick={() =>
                      this.props.addValuesToFilter(this.props.name,this.state.valueFilter)
                    }
                    >
                      Apply
                    </a>
                    <a
                      role="button"
                      className="pvtButton"
                      onClick={() =>
                        this.setState({open: false})
                      }
                    >
                      Cancel
                    </a>
                      </div>
              )}
            {showMenu &&(
              <BottomRenderer bottomRenderer={this.props.bottomRenderer} ></BottomRenderer>
              )}
        </div>
      </Draggable>
    );
  }

  toggleFilterBox() {
    this.setState({open: !this.state.open});
    this.props.moveFilterBoxToTop(this.props.name);
    if(Object.keys(this.props.valueFilter).length){
      this.setState({valueFilter:Object.keys(this.props.valueFilter)});
    }
  }

  render() {
    const filtered =
      Object.keys(this.props.valueFilter).length !== 0
        ? 'pvtFilteredAttribute'
        : '';

    return (
      <li data-id={this.props.name}>
        <span className={'pvtAttr ' + filtered}>
          <Button
            style={{
              backgroundColor: '#f3f3f3',
              padding: '1px 10px',
              textTransform: 'none',
            }}
            className="toggle-filter-box"
            variant="outlined"
            startIcon={
              this.props.name !== 'timeLevel' ? (
                <DragIndicatorIcon color="disabled" />
              ) : null
            }
            endIcon={<FilterAltIcon color="disabled" />}
            onClick={this.toggleFilterBox.bind(this)}
          >
            <span>
              { this.props.name !== 'timeLevel'? this.props.name !== 'Time'?this.props.name:'Period' : 'Timescale'}s
            </span>
          </Button>
        </span>
        {this.state.open ? this.getFilterBox() : null}
      </li>
    );
  }
}

DraggableAttribute.defaultProps = {
  valueFilter: {},
};

DraggableAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  addValuesToFilter: PropTypes.func.isRequired,
  removeValuesFromFilter: PropTypes.func.isRequired,
  valueFilter: PropTypes.objectOf(PropTypes.bool),
  moveFilterBoxToTop: PropTypes.func.isRequired,
  sorter: PropTypes.func.isRequired,
  menuLimit: PropTypes.number,
  zIndex: PropTypes.number,
  bottomRenderer: PropTypes.func,

};

export class Dropdown extends React.PureComponent {
  render() {
    return (
      <div className="pvtDropdown" style={{zIndex: this.props.zIndex}}>
        <div
          onClick={e => {
            e.stopPropagation();
            this.props.toggle();
          }}
          className={
            'pvtDropdownValue pvtDropdownCurrent ' +
            (this.props.open ? 'pvtDropdownCurrentOpen' : '')
          }
          role="button"
        >
          <div className="pvtDropdownIcon">{this.props.open ? '×' : '▾'}</div>
          {  this.props.current  || <span>&nbsp;</span>}
        </div>

        {this.props.open && (
          <div className="pvtDropdownMenu">
            {this.props.values.map(r => (
              <div
                key={r}
                role="button"
                onClick={e => {
                  e.stopPropagation();
                  if (this.props.current === r) {
                    this.props.toggle();
                  } else {
                    this.props.setValue(r);
                  }
                }}
                className={
                  'pvtDropdownValue ' +
                  (r === this.props.current ? 'pvtDropdownActiveValue' : '')
                }
              >
                {r}
              </div>
            ))}
            <Button>

            </Button>
          </div>
        )}
      </div>
    );
  }
}

class PivotTableUI extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValues: {},
      materializedInput: [],
    };
  }

  componentDidMount() {
    this.materializeInput(this.props.data);
    }

  componentDidUpdate() {
    this.materializeInput(this.props.data);
  }

  materializeInput(nextData) {
    if (this.state.data === nextData) {
      return;
    }
    const newState = {
      data: nextData,
      attrValues: {},
      materializedInput: [],
    };
    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInput.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValues)) {
            newState.attrValues[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValues[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValues) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValues[attr])) {
            newState.attrValues[attr][value] = 0;
          }
          newState.attrValues[attr][value]++;
        }
        recordsProcessed++;
      }
    );
    this.setState(newState);
  }

  sendPropUpdate(command) {
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key) {
    return value => this.sendPropUpdate({[key]: {$set: value}});
  }

  setValuesInFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {
        [attribute]: {
          $set: values.reduce((r, v) => {
            r[v] = true;
            return r;
          }, {}),
        },
      },
    });
  }

  addValuesToFilter(attribute, values) {
    if (attribute in this.props.valueFilter) {
     const newObj = update(this.props,{
        valueFilter: {
          [attribute]: values.reduce((r, v) => {
            r[v] = {$set: true};
            return r;
          }, {}),
         
        },
      });
      if(Object.keys(this.props.valueFilter[attribute]).filter(v=> !values.includes(v)).length){
         
        this.props.onChange(update(newObj,{valueFilter: {[attribute]:{$unset: Object.keys(this.props.valueFilter[attribute]).filter(v=> !values.includes(v))}}}))
      }else{
        this.props.onChange(newObj);
      }
    } else {
      this.setValuesInFilter(attribute, values);
    }
  }

  removeValuesFromFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {[attribute]: {$unset: values}},
    });
  }

  moveFilterBoxToTop(attribute) {
    this.setState(
      update(this.state, {
        maxZIndex: {$set: this.state.maxZIndex + 1},
        zIndices: {[attribute]: {$set: this.state.maxZIndex + 1}},
      })
    );
  }

  isOpen(dropdown) {
    return this.state.openDropdown === dropdown;
  }

  makeDnDCell(items, onChange, classes) {
    return (
      <Sortable
        options={{
          group: 'shared',
          ghostClass: 'pvtPlaceholder',
          filter: '.pvtFilterBox',
          preventOnFilter: false,
        }}
        tag="td"
        className={classes}
        onChange={onChange}
      >
        {items.map(x => (
          <DraggableAttribute
            name={x}
            key={x}
            attrValues={this.state.attrValues[x]}
            valueFilter={this.props.valueFilter[x] || {}}
            sorter={getSort(this.props.sorters, x)}
            menuLimit={this.props.menuLimit}
            setValuesInFilter={this.setValuesInFilter.bind(this)}
            addValuesToFilter={this.addValuesToFilter.bind(this)}
            moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
            removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
            zIndex={this.state.zIndices[x] || this.state.maxZIndex}
            bottomRenderer={this.props.bottomRenderer}
          />
        ))}
      </Sortable>
    );
  }

  render() {
    const rendererName =
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0];

    const rendererCell = (
      <td className="pvtRenderers">
        <Dropdown
          current={rendererName}
          values={Object.keys(this.props.renderers)}
          open={this.isOpen('renderer')}
          zIndex={this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('renderer') ? false : 'renderer',
            })
          }
          setValue={this.propUpdater('rendererName')}
        />
      </td>
    );

    const aggregatorCell = <td className="pvtVals"></td>;

    const unusedAttrs = Object.keys(this.state.attrValues)
      .filter(
        e =>
          !this.props.rows.includes(e) &&
          !this.props.cols.includes(e) &&
          !this.props.hiddenAttributes.includes(e) &&
          !this.props.hiddenFromDragDrop.includes(e)
      )
      .sort(sortAs(this.state.unusedOrder));

    const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
    const horizUnused = unusedLength < this.props.unusedOrientationCutoff;

    const unusedAttrsCell = this.makeDnDCell(
      unusedAttrs,
      order => this.setState({unusedOrder: order}),
      `pvtAxisContainer pvtUnused ${
        horizUnused ? 'pvtHorizList' : 'pvtVertList'
      }`
    );

    const colAttrs = this.props.cols.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );

    const colAttrsCell = this.makeDnDCell(
      colAttrs,
      this.propUpdater('cols'),
      'pvtAxisContainer pvtHorizList pvtCols'
    );

    const rowAttrs = this.props.rows.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );
    const rowAttrsCell = this.makeDnDCell(
      rowAttrs,
      this.propUpdater('rows'),
      'pvtAxisContainer pvtVertList pvtRows'
    );
    const outputCell = (
      <td className="pvtOutput">
        <PivotTable
          {...update(this.props, {
            data: {$set: this.state.materializedInput},
          })}
        />
      </td>
    );

    if (horizUnused) {
      return (
        <table className="pvtUi">
          <tbody onClick={() => this.setState({openDropdown: false})}>
            <tr>
              {rendererCell}
              {unusedAttrsCell}
            </tr>
            <tr>
              {aggregatorCell}
              {colAttrsCell}
            </tr>
            <tr>
              {rowAttrsCell}
              {outputCell}
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table className="pvtUi">
        <tbody onClick={() => this.setState({openDropdown: false})}>
          <tr>
            {rendererCell}
            {aggregatorCell}
            {colAttrsCell}
          </tr>
          <tr>
            {unusedAttrsCell}
            {rowAttrsCell}
            {outputCell}
          </tr>
        </tbody>
      </table>
    );
  }
}

PivotTableUI.propTypes = Object.assign({}, PivotTable.propTypes, {
  onChange: PropTypes.func.isRequired,
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  unusedOrientationCutoff: PropTypes.number,
  menuLimit: PropTypes.number,
  bottomRenderer: PropTypes.func,
});

PivotTableUI.defaultProps = Object.assign({}, PivotTable.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,
  bottomRenderer: ()=>{},
});

export default PivotTableUI;
