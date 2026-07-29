import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/application.service.js';
import toast from 'react-hot-toast';
import { timeAgo } from '../../lib/utils.js';

const STATUS_OPTIONS = ['viewed', 'shortlisted', 'interviewing', 'accepted', 'rejected'];

export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'job', jobId],
    queryFn: () => applicationService.listForJob(jobId, { limit: 50 }),
  });

  const applicants = data?.items ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, body }) => applicationService.updateStatus(id, body),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['applications', 'job', jobId] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500">Review and manage applications for this job</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : applicants.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No applicants yet</div>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => (
            <div key={app.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.studentName || 'Student'}</h3>
                  <p className="text-sm text-gray-500">
                    {app.studentCollege || 'College'} · {app.studentDegree || 'Degree'}
                  </p>
                  {app.coverLetter && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{app.coverLetter}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Applied {timeAgo(app.appliedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => statusMutation.mutate({ id: app.id, body: { status: e.target.value } })}
                    className="input text-sm w-32"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}