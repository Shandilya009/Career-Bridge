import { useForm } from 'react-hook-form';
import { postJob } from '../../api/recruiterApi';
import toast from 'react-hot-toast';

const ic = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50";

const PostJobForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data) => {
    try {
      // Convert data types
      data.package = parseFloat(data.package);
      data.minCGPA = parseFloat(data.minCGPA);
      data.allowedBranches = data.allowedBranches ? data.allowedBranches.split(',').map(s=>s.trim()).filter(s => s.length > 0) : [];
      
      // Ensure deadline is provided
      if (!data.deadline) {
        toast.error('Deadline is required');
        return;
      }
      
      // Log the data being sent for debugging
      console.log('Posting job with data:', data);
      
      await postJob(data);
      toast.success('Job posted successfully!');
      onSuccess();
    } catch(e) {
      console.error('Job posting error:', e.response?.data);
      
      // Handle validation errors (400)
      if (e.response?.status === 400) {
        const errorData = e.response.data;
        
        // Check if it's our custom validation format
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach(field => {
            const messages = errorData.errors[field];
            toast.error(`${field}: ${messages.join(', ')}`);
          });
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error('Validation failed. Please check all fields.');
        }
      }
      // Handle forbidden (403) - not approved
      else if (e.response?.status === 403) {
        toast.error(e.response.data?.message || 'Your account is not approved yet');
      }
      // Handle other errors
      else {
        toast.error(e.response?.data?.message || 'Failed to post job');
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input {...register('title')} placeholder="Job Title" className={ic} required />
      <textarea {...register('description')} placeholder="Job Description (min 10 characters)" rows={3} className={ic} required />
      <div className="grid grid-cols-2 gap-3">
        <input {...register('location')} placeholder="Location" className={ic} required />
        <select {...register('jobType')} className={ic} required>
          <option value="">Select Job Type</option>
          <option value="Full-time">Full Time</option>
          <option value="Internship">Internship</option>
          <option value="Part-time">Part Time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input {...register('package')} type="number" placeholder="Package (Annual)" className={ic} required min="0" />
        <input {...register('minCGPA')} type="number" step="0.1" placeholder="Min CGPA (0-10.0)" className={ic} required min="0" max="10" />
      </div>
      <input {...register('allowedBranches')} placeholder="Allowed Branches (comma separated)" className={ic} required />
      <input {...register('deadline')} type="date" className={ic} required min={new Date().toISOString().split('T')[0]} />
      <button type="submit" disabled={isSubmitting}
        className="w-full bg-teal-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium disabled:opacity-50">
        {isSubmitting ? 'Posting...' : 'Post Job'}
      </button>
    </form>
  );
};
export default PostJobForm;
