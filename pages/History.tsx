import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import type { AttendanceRecord } from '@/types';

// Mock data - replace with actual database queries
const mockHistory: AttendanceRecord[] = [
  {
    id: '1',
    userId: '1',
    checkInTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'success',
    verificationMethod: 'both',
  },
  {
    id: '2',
    userId: '1',
    checkInTime: new Date(Date.now() - 1000 * 60 * 60 * 26), // Yesterday
    status: 'success',
    verificationMethod: 'both',
  },
  {
    id: '3',
    userId: '1',
    checkInTime: new Date(Date.now() - 1000 * 60 * 60 * 50), // 2 days ago
    status: 'failed',
    verificationMethod: 'face',
  },
  {
    id: '4',
    userId: '1',
    checkInTime: new Date(Date.now() - 1000 * 60 * 60 * 74), // 3 days ago
    status: 'success',
    verificationMethod: 'both',
  },
];

export default function History() {
  const [records] = useState<AttendanceRecord[]>(mockHistory);

  // TODO: Fetch from database
  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     const { data } = await supabase
  //       .from('attendance')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .order('check_in_time', { ascending: false });
  //     setRecords(data);
  //   };
  //   fetchHistory();
  // }, [user.id]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Group records by date
  const groupedRecords = records.reduce((groups, record) => {
    const dateKey = formatDate(record.checkInTime);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(record);
    return groups;
  }, {} as Record<string, AttendanceRecord[]>);

  const successCount = records.filter(r => r.status === 'success').length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">
            {successCount} successful check-ins
          </p>
        </div>

        {/* Stats Card */}
        <Card className="glass">
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{records.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{successCount}</div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {records.length - successCount}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {Object.entries(groupedRecords).map(([date, dayRecords]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {date}
            </h3>
            <div className="space-y-2">
              {dayRecords.map(record => (
                <Card key={record.id} className="glass">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          record.status === 'success' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {record.status === 'success' 
                            ? <CheckCircle className="w-5 h-5" /> 
                            : <XCircle className="w-5 h-5" />
                          }
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            Check-in {record.status}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Verified via {record.verificationMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTime(record.checkInTime)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {records.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-1">No attendance records</h3>
              <p className="text-sm text-muted-foreground">
                Your check-in history will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
