export function useModal(selector: string) {
  const modal = document.querySelector<HTMLDialogElement>(selector);

  const onOpen = () => {
    modal?.showModal();
  };

  const onClose = () => {
    modal?.close();
  };

  return { onClose, onOpen };
}
