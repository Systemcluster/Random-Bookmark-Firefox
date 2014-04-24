all: osx

osx:
	zip -vr dist/random-bookmark-osx.xpi ./src/ -x *xpi* -x *.DS_Store -x *.dropbox -x *.git -x .git

windows:
	cd src
	7z a -tzip -mx1 -x!random-bookmark.xpi -x!*xpi* -x!.dropbox -x!.DS_Store -x!desktop.ini "../dist/random-bookmark.xpi" *

clean:
	rm dist/*.xpi

clean-windows:
	del "dist/*.xpi"
