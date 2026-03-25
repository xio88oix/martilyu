/**
 * Human-readable validation error strings returned by advancedValidationIssues().
 */
export const VALIDATION_MESSAGES = {
  routeMustChange: 'The route must be changed to resolve a discrepancy.',
  missingDiscrepantReason: 'Missing Line Item Discrepant reason.',
  invalidReceiving: '',
  rpgheldBoxMismatch: 'RPGHELD requires Total Boxes added to Box Attributes to equal the number of Pieces selected',
  cryptoBoxMismatch: 'Crypto requires Total Boxes added to Box Attributes to equal the number of Pieces selected',
  totalBoxMismatch: 'Total Boxes added to Box Attributes does not equal number of Pieces selected',
  rpgheldDimsMissing: 'RPGHELD requires DIMs and Weight in Box Attributes to be greater than 0. Please correct row(s).',
  cryptoDimsMissing: 'Crypto requires DIMs and Weight in Box Attributes to be greater than 0. Please correct row(s).',
  boxPieceMissing: 'Box/Piece information missing for line item received',
  boxPieceNotFound: 'Box/Piece information not found for Box ',
  lineQtyMismatch: 'Line item receive quantity does not match total quantity in Box/Piece for Line # ',
  missingBinLot: 'A lot & bin are required for a received line item with a lot type of LOT. Please fix line #(s) ',
  lineNotPrevReceived: 'Line item not previously received, the receive quantity cannot be updated for Line # ',
  responsibleOfficeRequired: 'Responsible office code is required for returned line items.',
  assetInfoMissing: 'Asset information not found for a Rotating Line',
  noBoxExists: 'Box/Piece does not exist for Box ID [',
  blankReferenceNumber: 'Found blank reference number. Please correct or remove row.',
} as const;
