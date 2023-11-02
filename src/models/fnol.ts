export interface FnolEntity {
  PartitionKey: string;
  RowKey: string;
  Data: string;
  Status: 'New' | 'Submitted' | 'Processed';
}
