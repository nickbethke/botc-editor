import DirectionHelper from '../renderer/components/generator/helper/DirectionHelper';
import { DirectionEnum } from '../interfaces/BoardConfigInterface';
import TranslationHelper, { AvailableLanguages } from '../renderer/helper/TranslationHelper';

describe('direction helper', () => {
	test('get next direction', () => {
		expect(DirectionHelper.getNextDirection('NORTH')).toBe('EAST');
		expect(DirectionHelper.getNextDirection('EAST')).toBe('SOUTH');
		expect(DirectionHelper.getNextDirection('SOUTH')).toBe('WEST');
		expect(DirectionHelper.getNextDirection('WEST')).toBe('NORTH');
	});

	test('get previous direction', () => {
		expect(DirectionHelper.getPreviousDirection('NORTH')).toBe('WEST');
		expect(DirectionHelper.getPreviousDirection('EAST')).toBe('NORTH');
		expect(DirectionHelper.getPreviousDirection('SOUTH')).toBe('EAST');
		expect(DirectionHelper.getPreviousDirection('WEST')).toBe('SOUTH');
	});

	test('direction to direction enum', () => {
		expect(DirectionHelper.string2DirEnum('NORTH')).toBe(DirectionEnum.NORTH);
		expect(DirectionHelper.string2DirEnum('EAST')).toBe(DirectionEnum.EAST);
		expect(DirectionHelper.string2DirEnum('SOUTH')).toBe(DirectionEnum.SOUTH);
		expect(DirectionHelper.string2DirEnum('WEST')).toBe(DirectionEnum.WEST);
	});
});

describe('translation helper', () => {
	test('translation helper', () => {
		const translationHelper = new TranslationHelper(AvailableLanguages.en, true);
		expect(translationHelper.translate('test')).toBe('test');
	});
});
