import {
    createDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Button,
} from '@hope-ui/solid';
import { createEffect } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { openItemsModel } from 'features/open-items';
import { gameModel } from 'entities/game';

export const WinnerModal = () => {
    const { isOpen, onOpen, onClose } = createDisclosure();

    const [isWin, openedNumbersCount, numbersCount] = useUnit([
        openItemsModel.$isWin,
        openItemsModel.$openedNumbersCount,
        gameModel.$numbersCount,
    ]);

    createEffect(() => {
        console.log(openedNumbersCount(), 'openedNumbersCount');
        console.log(numbersCount(), 'numbersCount()');
    });
    createEffect(() => {
        console.log(isWin(), 'isWin()');
        if (isWin()) {
            onOpen();
        }
    });

    return (
        <Modal centered opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalHeader>Winner! Winner! Chicken Dinner!</ModalHeader>
                <ModalBody>
                    <p>You are doing great!</p>
                    <p>Юля, ты молодец!</p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
