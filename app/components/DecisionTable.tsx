type Props = {
  decisions: any[];
};

export default function DecisionTable({ decisions }: Props) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left p-2">Agent</th>
          <th className="text-left p-2">Action</th>
          <th className="text-left p-2">Decision</th>
        </tr>
      </thead>

      <tbody>
        {decisions.map((d, i) => (
          <tr key={i}>
            <td className="p-2">{d.agent_id}</td>
            <td className="p-2">{d.action}</td>
            <td className="p-2">{d.decision}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}