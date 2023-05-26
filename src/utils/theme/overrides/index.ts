import Fab,{FabCustomTheme} from './Fab';
import Card,{CardCustomTheme} from './Card';
import Chip from './Chip';
import Tabs from './Tabs';
import Menu from './Menu';
import Link from './Link';
import Lists from './List';
import Table from './Table';
import Alert from './Alert';
import Badge from './Badge';
import Paper from './Paper';
import Input from './Input';
import Radio from './Radio';
import Drawer from './Drawer';
import Dialog,{DialogCustomTheme} from './Dialog';
import Avatar from './Avatar';
import Rating from './Rating';
import Slider from './Slider';
import Button,{ButtonCustomTheme} from './Button';
import Switch,{SwitchCustomTheme} from './Switch';
import Select from './Select';
import SvgIcon from './SvgIcon';
import Tooltip from './Tooltip';
import Popover,{PopoverCustomTheme} from './Popover';
import Stepper from './Stepper';
import DataGrid,{DataGridCustomTheme} from './DataGrid';
import Skeleton from './Skeleton';
import Backdrop from './Backdrop';
import Progress from './Progress';
import Timeline from './Timeline';
import TreeView from './TreeView';
import Checkbox from './Checkbox';
import Accordion,{AccordionCustomTheme} from './Accordion';
import Typography from './Typography';
import Pagination from './Pagination';
import Breadcrumbs from './Breadcrumbs';
import ButtonGroup,{ButtonGroupCustomTheme} from './ButtonGroup';
import CssBaseline from './CssBaseline';
import Autocomplete,{AutocompleteCustomTheme} from './Autocomplete';
import ToggleButton from './ToggleButton';
import ControlLabel from './ControlLabel';
import LoadingButton from './LoadingButton';
import { Theme } from '@mui/material';
// ----------------------------------------------------------------------

export default function ComponentsOverrides(theme:Theme) {
  return Object.assign(
    Fab(theme as FabCustomTheme),
    Tabs(theme),
    Chip(theme),
    Card(theme as CardCustomTheme),
    Menu(theme),
    Link(),
    Input(theme),
    Radio(theme),
    Badge(),
    Lists(theme),
    Table(theme),
    Paper(theme),
    Alert(theme),
    Switch(theme as SwitchCustomTheme),
    Select(),
    Button(theme as ButtonCustomTheme),
    Rating(theme),
    Dialog(theme as DialogCustomTheme),
    Avatar(theme),
    Slider(theme),
    Drawer(theme),
    Stepper(theme),
    Tooltip(theme),
    Popover(theme as PopoverCustomTheme),
    SvgIcon(),
    Checkbox(theme),
    DataGrid(theme as DataGridCustomTheme),
    Skeleton(theme),
    Timeline(theme),
    TreeView(theme),
    Backdrop(theme),
    Progress(theme),
    Accordion(theme as AccordionCustomTheme),
    Typography(theme),
    Pagination(theme),
    ButtonGroup(theme as ButtonGroupCustomTheme),
    Breadcrumbs(theme),
    CssBaseline(),
    Autocomplete(theme as AutocompleteCustomTheme),
    ControlLabel(theme),
    ToggleButton(theme),
    LoadingButton()
  );
}
