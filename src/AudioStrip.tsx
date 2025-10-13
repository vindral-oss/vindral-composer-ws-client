import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import type { ComposerAudioObject, UniqueSelection } from "./App";

export interface AudioStripProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  lastUpdateProperty?: UniqueSelection;
}

export const AudioStrip = ({
  audioObject,
  setCurrentSelectionFn,
  lastUpdateProperty,
}: AudioStripProps) => (
  <Paper elevation={3} className="p-4">
    <h1 className="text-2xl">Name: {audioObject.Name}</h1>
    <h1 className="text-xl">ID: {audioObject.Id}</h1>
    <h1 className="mt-8">Properties</h1>
    <TableContainer component={Paper} className="mt-2">
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell className="font-extrabold">Name</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">CanWrite</TableCell>
            <TableCell align="right">ValueEnum</TableCell>
            <TableCell align="right">Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {audioObject.Properties.map((property) => (
            <TableRow
              key={property.PropertyName}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell
                onClick={(e) =>
                  property.CanWrite &&
                  setCurrentSelectionFn({
                    Id: audioObject.Id,
                    Property: (e.target as HTMLTableRowElement).innerText,
                  })
                }
                className={`${
                  property.CanWrite
                    ? "cursor-pointer hover:bg-gray-300"
                    : "cursor-not-allowed"
                }`}
                component="th"
                scope="row"
              >
                {property.PropertyName}
              </TableCell>
              <TableCell align="right">{property.PropertyType}</TableCell>
              <TableCell
                className={`${
                  lastUpdateProperty?.Property === property.PropertyName &&
                  lastUpdateProperty?.Id === audioObject.Id
                    ? "blink"
                    : "white"
                }`}
                align="right"
              >
                {String(property.Value)}
              </TableCell>
              <TableCell align="right">{String(property.CanWrite)}</TableCell>
              <TableCell align="right">{property.ValueEnum}</TableCell>
              <TableCell align="right">
                {property.PropertyDescription}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);
