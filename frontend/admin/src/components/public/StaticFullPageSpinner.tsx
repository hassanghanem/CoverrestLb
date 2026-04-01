import Spinner from "./spinner";

export default function StaticFullPageSpinner() {
  return (
    <div style={styles.loaderOverlay}>
      <Spinner />
    </div>
  );
}

const styles: {
  loaderOverlay: React.CSSProperties;
} = {
  loaderOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
};
