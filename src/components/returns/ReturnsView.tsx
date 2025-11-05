import { useAppSelector } from '@/store/hooks';
import { selectReturns } from '@/store/selectors';
import { ReturnStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, FileText } from 'lucide-react';

import { getStatusBadgeClass } from '@/theme/utils';

const getReturnStatusClass = (status: ReturnStatus) => {
  const statusMap: Record<ReturnStatus, string> = {
    Requested: getStatusBadgeClass('return', 'Requested'),
    Approved: getStatusBadgeClass('return', 'Approved'),
    Refunded: getStatusBadgeClass('return', 'Refunded'),
    Rejected: getStatusBadgeClass('return', 'Rejected'),
  };
  return statusMap[status] || getStatusBadgeClass('return', 'Requested');
};

export function ReturnsView() {
  const returns = useAppSelector(selectReturns);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Returns Management</h1>
        <p className="text-muted-foreground">Process returns and refunds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Refundable Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">{returnItem.id}</TableCell>
                  <TableCell>{returnItem.orderId}</TableCell>
                  <TableCell>{format(returnItem.dateCreated, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{returnItem.customer.name}</div>
                      {returnItem.customer.isCompany && (
                        <div className="text-xs text-muted-foreground">
                          {returnItem.customer.companyName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{returnItem.items.length} items</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        €{returnItem.refundableAmountEUR.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PLN {returnItem.refundableAmountPLN.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnStatusClass(returnItem.status)}`}
                    >
                      {returnItem.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}




