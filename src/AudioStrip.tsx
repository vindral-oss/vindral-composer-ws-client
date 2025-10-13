import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import type { ComposerAudioObject, UniqueSelection } from "./App";
import { styled } from "@mui/material/styles";

export interface AudioStripProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  lastUpdateProperty?: UniqueSelection;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export const AudioStrip = ({
  audioObject,
  setCurrentSelectionFn,
  lastUpdateProperty,
}: AudioStripProps) => (
  <div className="p-4">
    <h1 className="text-xl">{audioObject.Name}</h1>
    <h1>{audioObject.Id}</h1>
    <TableContainer component={Paper} className="mt-2">
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            {/* <StyledTableCell align="right">Type</StyledTableCell> */}
            <StyledTableCell align="right">Value</StyledTableCell>
            <StyledTableCell align="right">Writeable</StyledTableCell>
            {/* <StyledTableCell align="right">ValueEnum</StyledTableCell> */}
            <StyledTableCell align="right">Description</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {audioObject.Properties.map((property) => (
            <StyledTableRow
              className="even:bg-gray-50 odd:bg-gray-200 hover:bg-gray-300"
              key={property.PropertyName}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <StyledTableCell
                onClick={(e) =>
                  property.CanWrite &&
                  setCurrentSelectionFn({
                    AudioStripName: audioObject.Name,
                    PropertyId: audioObject.Id,
                    PropertyName: (e.target as HTMLTableRowElement).innerText,
                  })
                }
                className={`${
                  property.CanWrite ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                component="th"
                scope="row"
              >
                {property.PropertyName}
              </StyledTableCell>
              {/* <TableCell align="right">{property.PropertyType}</TableCell> */}
              <StyledTableCell
                className={`${
                  lastUpdateProperty?.PropertyName === property.PropertyName &&
                  lastUpdateProperty?.PropertyId === audioObject.Id
                    ? "blink"
                    : "white"
                }`}
                align="right"
              >
                {String(property.Value)}
              </StyledTableCell>
              <StyledTableCell align="right">
                {String(property.CanWrite)}
              </StyledTableCell>
              {/* <TableCell align="right">{property.ValueEnum}</TableCell> */}
              <StyledTableCell align="right">
                {property.PropertyDescription}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
);
